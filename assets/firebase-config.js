/* ==========================================================================
   FIREBASE CONFIG
   --------------------------------------------------------------------------
   Replace the values below with your own Firebase project's config.
   Firebase Console → Project settings → General → Your apps → SDK setup
   ========================================================================== */
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db   = firebase.firestore();

/* Admin email — only this account can access admin.html */
const ADMIN_EMAIL = "info.itzmahin@gmail.com";
