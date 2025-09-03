// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";

// =========================================================================================
// TODO: PASTE YOUR FIREBASE CONFIGURATION OBJECT HERE
// =========================================================================================
// 1. Go to your Firebase project: "IndMonMachine"
// 2. Go to Project Settings (gear icon).
// 3. In the "General" tab, scroll down to "Your apps".
// 4. Find your web app and copy the `firebaseConfig` object here.
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
