import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, Firestore, connectFirestoreEmulator } from "firebase/firestore";

// Check if we're in a build environment
const isBuildTime = process.env.NODE_ENV === 'production' && !process.env.VERCEL && !process.env.NETLIFY;

// Validate required environment variables
const hasRequiredConfig = process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

if (!hasRequiredConfig && !isBuildTime) {
  console.error('Missing required Firebase configuration. Check your environment variables.');
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'placeholder-api-key',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'placeholder.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'placeholder-project',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'placeholder-project.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:123456789:web:placeholder',
};

// Initialize Firebase with error handling
let firebaseApp: FirebaseApp;
let auth: Auth;
let db: Firestore;

try {
  firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  auth = getAuth(firebaseApp);
  db = getFirestore(firebaseApp);
  
  // Enable offline persistence for better reliability
  if (typeof window !== 'undefined' && !isBuildTime) {
    // Configure Firestore settings for better performance
    import('firebase/firestore').then(({ enableNetwork, disableNetwork }) => {
      // Enable network by default, but handle offline gracefully
      enableNetwork(db).catch((error) => {
        console.warn('Failed to enable Firestore network:', error);
      });
    });
  }
} catch (error) {
  console.error('Error initializing Firebase:', error);
  if (isBuildTime) {
    console.warn('Firebase initialization failed during build, creating mock instances');
    // Create mock instances for build time
    firebaseApp = {} as FirebaseApp;
    auth = {} as Auth;
    db = {} as Firestore;
  } else {
    throw error;
  }
}

// Utility functions to ensure Firebase is properly initialized
export function getFirebaseAuth(): Auth {
  if (!auth || Object.keys(auth).length === 0) {
    throw new Error('Firebase Auth is not initialized. Please check your Firebase configuration.');
  }
  return auth;
}

export function getFirebaseFirestore(): Firestore {
  if (!db || Object.keys(db).length === 0) {
    throw new Error('Firebase Firestore is not initialized. Please check your Firebase configuration.');
  }
  return db;
}

// Export the instances directly for backward compatibility
export { auth, db };
// End of file