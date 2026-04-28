import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore, initializeFirestore, persistentLocalCache } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export function getFirebaseApp(): FirebaseApp {
  if (typeof window === 'undefined') {
    throw new Error('Firebase Client can only be initialized on the client side');
  }

  if (getApps().length > 0) {
    return getApps()[0];
  }

  // Validate required config
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    throw new Error('Firebase configuration is incomplete');
  }

  return initializeApp(firebaseConfig);
}

export function getFirebaseAuth(): Auth {
  return getAuth(getFirebaseApp());
}

let firestoreInstance: Firestore | null = null;

export function getFirebaseDb(): Firestore {
  if (!firestoreInstance) {
    const app = getFirebaseApp();
    try {
      // Try to use persistent local cache with multi-tab synchronization enabled
      firestoreInstance = initializeFirestore(app, {
        localCache: persistentLocalCache({
          tabManager: {
            // Enable multi-tab synchronization to prevent conflicts
            forceOwnership: false,
          },
        }),
      });
    } catch (error: any) {
      // If persistence layer fails (e.g., due to multi-tab conflict), fall back to memory cache
      console.warn('Firestore persistent cache initialization failed, using memory cache:', error?.message);
      try {
        firestoreInstance = getFirestore(app);
      } catch (fallbackError) {
        console.error('Firestore initialization failed completely:', fallbackError);
        throw fallbackError;
      }
    }
  }

  return firestoreInstance;
}
