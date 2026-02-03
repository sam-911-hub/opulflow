import admin from 'firebase-admin';

export function getAdmin() {
  if (!admin.apps.length) {
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY
      ? process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n')
      : undefined;

    const missing = !process.env.FIREBASE_ADMIN_PROJECT_ID || !process.env.FIREBASE_ADMIN_CLIENT_EMAIL || !privateKey;

    if (missing) {
      // Return a proxy that throws when any admin method is accessed to avoid failing at import time
      const message = 'FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, and FIREBASE_ADMIN_PRIVATE_KEY must be set';
      const handler = {
        get(_target: any, prop: string) {
          throw new Error(`${message} — attempted to access admin.${prop}`);
        },
        apply() {
          throw new Error(message);
        }
      };
      return new Proxy({}, handler) as unknown as typeof admin;
    }

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey,
      }),
    });
  }
  return admin;
}

export const getAuthAdmin = () => getAdmin().auth ? getAdmin().auth() : getAdmin().auth();
export const getFirestoreAdmin = () => getAdmin().firestore ? getAdmin().firestore() : getAdmin().firestore();
