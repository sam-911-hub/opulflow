// This file is used for Edge runtime (middleware)
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin for Edge runtime
function initAdmin() {
  const apps = getApps();
  if (apps.length > 0) {
    return apps[0];
  }

  try {
    return initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error) {
    console.error('Error initializing Firebase Admin for Edge:', error);
    throw error;
  }
}

// Get Firebase Admin Auth
export function getAdminAuth() {
  try {
    const app = initAdmin();
    return getAuth(app);
  } catch (error) {
    console.error('Error getting admin auth:', error);
    throw error;
  }
}