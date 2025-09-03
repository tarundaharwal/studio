// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";

// =========================================================================================
// The user's Firebase Project Configuration
// =========================================================================================
const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyBl65JN31ewjDjXtFzST1X1gxgZ9rvBbSQ",
  authDomain: "indmonmachine.firebaseapp.com",
  projectId: "indmonmachine",
  storageBucket: "indmonmachine.firebasestorage.app",
  messagingSenderId: "727618530118",
  appId: "1:727618530118:web:4bb56062eaf5b55b831347",
  measurementId: "G-67405GEZ2C"
};


// Helper to check if the config is just a placeholder
export const isFirebaseConfigured = () => {
    return firebaseConfig && firebaseConfig.apiKey && !firebaseConfig.apiKey.includes('...');
};

// Initialize Firebase App
// This line handles app initialization, preventing errors from re-initializing.
// It will only initialize if the config is valid.
export const app = isFirebaseConfigured() && !getApps().length ? initializeApp(firebaseConfig) : (getApps().length > 0 ? getApp() : undefined);
