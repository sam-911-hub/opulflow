import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Validate required environment variables
if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
    !process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    !process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
  console.error('Missing required Firebase configuration. Check your environment variables.');
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
let firebaseApp;
try {
  firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
} catch (error) {
  console.error('Error initializing Firebase:', error);
  throw error;
}

export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
// End of file