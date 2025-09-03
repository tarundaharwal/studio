// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";

// =========================================================================================
// TODO: PASTE YOUR FIREBASE CONFIGURATION OBJECT HERE
// =========================================================================================
// 1. Go to https://console.firebase.google.com/ and create a new project.
// 2. In your project dashboard, click the web icon (</>) to add a web app.
// 3. Follow the steps, and Firebase will give you a `firebaseConfig` object.
// 4. Paste that entire object here, replacing the placeholder below.
// 5. In the Firebase Console, go to Build > Authentication > Sign-in method and enable "Email/Password".
// =========================================================================================

const firebaseConfig: FirebaseOptions = {
  // --- PASTE YOUR FIREBASE CONFIG OBJECT HERE ---
  // apiKey: "AIza....",
  // authDomain: "your-project.firebaseapp.com",
  // projectId: "your-project",
  // storageBucket: "your-project.appspot.com",
  // messagingSenderId: "...",
  // appId: "..."
  // ---------------------------------------------
};


// Helper to check if the config is just a placeholder
export const isFirebaseConfigured = () => {
    return firebaseConfig && firebaseConfig.apiKey && !firebaseConfig.apiKey.includes('...');
};

// Initialize Firebase App
// This line handles app initialization, preventing errors from re-initializing.
// It will only initialize if the config is valid.
export const app = isFirebaseConfigured() && !getApps().length ? initializeApp(firebaseConfig) : (getApps().length > 0 ? getApp() : undefined);
