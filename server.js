const express = require("express");
const path = require("path");
const admin = require("firebase-admin");
let serviceAccount;
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} else {
    serviceAccount = require("./job-finder-cbf74-firebase-adminsdk-fbsvc-b9e31fb930.json");
}

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
    res.sendFile(path.join(__dirname, "public", "index12.html"));
});

app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname,"public","login12.html"));
});

app.get("/signup", (req, res) => {
    res.sendFile(path.join(__dirname,"public","signup12.html"));
});

app.post("/api/signup", async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: "Name, email, and password are required" 
            });
        }

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
        
        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: "Email and password are required" 
            });
        }

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
            uid: userRecord.uid,
            note: "Password verification should be done on client-side with Firebase Auth"
        });

    } catch (error) {
        console.error("Error during login:", error);
        
        await db.collection('loginLogs').add({
            email: req.body.email || 'unknown',
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
            const userData = doc.data();
            delete userData.password; 
            users.push({ id: doc.id, ...userData });
        });
        res.json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ error: error.message });
    }
});

app.get("/api/health", (req, res) => {
    res.json({ status: "OK", timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
