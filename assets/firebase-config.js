/* ==========================================================================
   FIREBASE CONFIG
   --------------------------------------------------------------------------
   Replace the values below with your own Firebase project's config.
   Firebase Console → Project settings → General → Your apps → SDK setup
   ========================================================================== */
const firebaseConfig = {
    apiKey: "AIzaSyBzvwSAE2l1HyE0QvtREcYJ5WOrewxRPPk",
    authDomain: "admcbymahin.firebaseapp.com",
    projectId: "admcbymahin",
    storageBucket: "admcbymahin.firebasestorage.app",
    messagingSenderId: "956994115039",
    appId: "1:956994115039:web:e42eca33d6abbdc8bde06a",
    measurementId: "G-4K7MP9457B"
  };

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db   = firebase.firestore();

/* Admin email — only this account can access admin.html */
const ADMIN_EMAIL = "info.itzmahin@gmail.com";
