const express = require("express");
const path = require("path");
const admin = require("firebase-admin");

// Use environment variables instead of JSON file
const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://job-finder-cbf74-default-rtdb.firebaseio.com"
});

const db = admin.firestore();

const app = express();
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get("/signup", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "signup.html"));
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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
