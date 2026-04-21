import { initializeApp, getApps, cert, FirebaseApp } from 'firebase-admin/app';
import { getAuth as getAdminAuth, Auth } from 'firebase-admin/auth';
import { getFirestore as getAdminFirestore, Firestore } from 'firebase-admin/firestore';

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
let privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

if (privateKey?.includes('\\n')) {
  privateKey = privateKey.replace(/\\n/g, '\n');
}

if (privateKey && !privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
  privateKey = `-----BEGIN PRIVATE KEY-----\n${privateKey}\n-----END PRIVATE KEY-----\n`;
}

export function getFirebaseAdminApp(): FirebaseApp {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error('Missing Firebase Admin environment variables: FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY');
  }

  return initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
}

export function getFirebaseAdminAuth(): Auth {
  return getAdminAuth(getFirebaseAdminApp());
}

export function getFirebaseAdminDb(): Firestore {
  return getAdminFirestore(getFirebaseAdminApp());
}