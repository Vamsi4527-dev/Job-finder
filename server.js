const express = require("express");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const admin = require("firebase-admin");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : require("./job-finder-cbf74-firebase-adminsdk-fbsvc-b9e31fb930.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://job-finder-cbf74-default-rtdb.firebaseio.com",
});

const db = admin.firestore();

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
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields required." });
    }

    const user = await admin.auth().createUser({
      displayName: name,
      email,
      password,
    });

    await db.collection("users").doc(user.uid).set({
      name,
      email,
      uid: user.uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({ success: true, uid: user.uid, message: "User created." });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

app.post("/api/login", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await admin.auth().getUserByEmail(email);

    await db.collection("loginLogs").add({
      uid: user.uid,
      email,
      loginTime: admin.firestore.FieldValue.serverTimestamp(),
      success: true,
    });

    res.json({
      success: true,
      uid: user.uid,
      message: "Login email found. Use Firebase Auth on client side for password check.",
    });
  } catch (error) {
    await db.collection("loginLogs").add({
      email: email || "unknown",
      loginTime: admin.firestore.FieldValue.serverTimestamp(),
      success: false,
      error: error.message,
    });

    res.status(400).json({ success: false, message: error.message });
  }
});

app.get("/api/users", async (req, res) => {
  try {
    const snapshot = await db.collection("users").get();
    const users = snapshot.docs.map(doc => {
      const data = doc.data();
      delete data.password;
      return { id: doc.id, ...data };
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

