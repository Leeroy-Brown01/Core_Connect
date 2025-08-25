// Import core Firebase and services for use in development environment
import { initializeApp } from "firebase/app"; // Initialize Firebase app
import { getAnalytics } from "firebase/analytics"; // Firebase Analytics
import { getFirestore } from "firebase/firestore"; // Firestore database
import { getAuth } from "firebase/auth"; // Firebase Authentication

// Development environment configuration
export const environment = {
  production: false, // Flag indicating development mode
  firebase: {
    apiKey: "AIzaSyCg5AlYl271hrgSMIzaX7aDpjqKBtmdKrw", // Firebase API key
    authDomain: "core-connect-85bf8.firebaseapp.com", // Firebase Auth domain
    projectId: "core-connect-85bf8", // Firebase project ID
    storageBucket: "core-connect-85bf8.firebasestorage.app", // Firebase Storage bucket
    messagingSenderId: "1097346357094", // Firebase Cloud Messaging sender ID
    appId: "1:1097346357094:web:b8e9b6ed4b72254aeedaa7" // Firebase App ID
  }
};
