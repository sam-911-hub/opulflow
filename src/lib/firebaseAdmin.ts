import admin from 'firebase-admin';

export function getAdmin() {
  if (!admin.apps.length) {
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY
      ? process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n')
      : undefined;

    const missing = !process.env.FIREBASE_ADMIN_PROJECT_ID || !process.env.FIREBASE_ADMIN_CLIENT_EMAIL || !privateKey;

    if (missing) {
      // Return a safe stub so imports and build-time page collection do not throw.
      const message = 'FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, and FIREBASE_ADMIN_PRIVATE_KEY must be set';

      const stub: any = {
        auth: () => ({
          verifyIdToken: async () => { throw new Error(message); },
          getUser: async () => { throw new Error(message); },
          createCustomToken: async () => { throw new Error(message); },
        }),
        firestore: () => ({
          collection: (_name: string) => ({
            doc: (_id?: string) => ({
              get: async () => null,
              set: async () => { throw new Error(message); },
              update: async () => { throw new Error(message); },
            }),
            add: async () => { throw new Error(message); },
          }),
        }),
      };

      return stub as typeof admin;
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

export const getAuthAdmin = () => getAdmin().auth();
export const getFirestoreAdmin = () => getAdmin().firestore();
