// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDPs5zaEa11S43d5xSj5lJz3a9rF9e5p9Y",
  authDomain: "dev-session-20240822-83549.firebaseapp.com",
  projectId: "dev-session-20240822-83549",
  storageBucket: "dev-session-20240822-83549.appspot.com",
  messagingSenderId: "633190282126",
  appId: "1:633190282126:web:1301297e59b92641031846"
};

// Initialize Firebase
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
