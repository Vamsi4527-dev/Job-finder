const express = require("express");
const path = require("path");
const fs = require("fs");
const admin = require("firebase-admin");

// Debug: Check if file exists
const jsonPath = path.join(__dirname, "job-finder-cbf74-firebase-adminsdk-fbsvc-b9e31fb930.json");
console.log("JSON file path:", jsonPath);
console.log("File exists:", fs.existsSync(jsonPath));

const serviceAccount = require("./job-finder-cbf74-firebase-adminsdk-fbsvc-b9e31fb930.json");

// Debug: Check what's actually loaded
console.log("Service account loaded:", {
  type: serviceAccount.type,
  project_id: serviceAccount.project_id,
  hasPrivateKey: !!serviceAccount.private_key,
  client_email: serviceAccount.client_email
});

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

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
