const express = require("express");
const path = require("path");
const admin = require("firebase-admin");

// Firebase Admin initialization (prevent multiple initializations)
function initializeFirebase() {
  if (!admin.apps || !admin.apps.length) {
    const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH || "./firebase-service-account.json");
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: "https://job-finder-cbf74-default-rtdb.firebaseio.com"
    });
  }
}

initializeFirebase();
const db = admin.firestore();

const app = express();
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index12.html"));
});

app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "login12.html"));
});

app.get("/signup", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "signup12.html"));
});

app.post("/api/signup", async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        
        const userRecord = await admin.auth().createUser({
            email: email,
            password: password,
            displayName: name,
        });

       
        await db.collection('users').doc(userRecord.uid).set({
            name: name,
            email: email,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            uid: userRecord.uid
        });

        res.json({ 
            success: true, 
            message: "User created successfully",
            uid: userRecord.uid 
        });

    } catch (error) {
        console.error("Error creating user:", error);
        res.status(400).json({ 
            success: false, 
            message: error.message 
        });
    }
});

app.post("/api/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        
        
        const userRecord = await admin.auth().getUserByEmail(email);
        
        await db.collection('loginLogs').add({
            email: email,
            uid: userRecord.uid,
            loginTime: admin.firestore.FieldValue.serverTimestamp(),
            success: true
        });

        res.json({ 
            success: true, 
            message: "Login successful",
            uid: userRecord.uid 
        });

    } catch (error) {
        console.error("Error during login:", error);
        await db.collection('loginLogs').add({
            email: req.body.email,
            loginTime: admin.firestore.FieldValue.serverTimestamp(),
            success: false,
            error: error.message
        });

        res.status(400).json({ 
            success: false, 
            message: "Login failed: " + error.message 
        });
    }
});

app.get("/api/users", async (req, res) => {
    try {
        const snapshot = await db.collection('users').get();
        const users = [];
        snapshot.forEach(doc => {
            users.push({ id: doc.id, ...doc.data() });
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Export the app for Vercel serverless
module.exports = app;

// Only listen if running locally
if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

