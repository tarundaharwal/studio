// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";

// =========================================================================================
// TODO: PASTE YOUR FIREBASE CONFIGURATION OBJECT HERE
// =========================================================================================
// 1. Go to https://console.firebase.google.com/ and create a new project.
// 2. In your project dashboard, click the web icon (</>) to add a web app.
// 3. Follow the steps, and Firebase will give you a `firebaseConfig` object.
// 4. Paste that entire object here, replacing the placeholder below.
// 5. In the Firebase Console, go to Build > Authentication > Sign-in method and enable "Email/Password".
// =========================================================================================

const firebaseConfig = {
  apiKey: "PASTE_YOUR_API_KEY_HERE",
  authDomain: "PASTE_YOUR_AUTH_DOMAIN_HERE",
  projectId: "PASTE_YOUR_PROJECT_ID_HERE",
  storageBucket: "PASTE_YOUR_STORAGE_BUCKET_HERE",
  messagingSenderId: "PASTE_YOUR_MESSAGING_SENDER_ID_HERE",
  appId: "PASTE_YOUR_APP_ID_HERE"
};


// Initialize Firebase
// This line automatically handles app initialization, preventing errors from re-initializing.
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
