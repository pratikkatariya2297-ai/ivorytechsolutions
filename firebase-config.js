// ═══════════════════════════════════════════════════════
//   IVORY TECH SOLUTIONS — FIREBASE CONFIGURATION
// ═══════════════════════════════════════════════════════

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCRVlgMOjpGiLOk1ucfvkrIV0a_s4jCp0M",
  authDomain: "ivorytechsolutions-5011d.firebaseapp.com",
  projectId: "ivorytechsolutions-5011d",
  storageBucket: "ivorytechsolutions-5011d.firebasestorage.app",
  messagingSenderId: "1086099134750",
  appId: "1:1086099134750:web:807fc650837b07b3bd110f",
  measurementId: "G-9Q03XRKMY8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, analytics, db, auth };
