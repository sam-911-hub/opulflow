import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Helper function to initialize schema
export async function initFirestoreSchema(userId: string) {
  try {
    // Create user document if not exists
    await setDoc(doc(db, "users", userId), {
      email: "",
      accountType: "free",
      credits: {
        ai: 0,
        leads: 0,
        enrichment: 0,
        company: 0,
        email: 0,
        workflow: 0,
        crm: 0
      },
      usage: {
        leads: 0,
        enrichment: 0,
        workflowRuns: 0,
        emailWriter: 0,
        callScripts: 0
      },
      createdAt: new Date().toISOString(),
      resetDate: new Date().toISOString(),
    }, { merge: true });

    // Create default team for the user
    await setDoc(doc(db, "teams", userId), {
      name: "My Team",
      owner: userId,
      members: [userId],
      createdAt: new Date().toISOString(),
    });

    // Add user as admin to their own team
    await setDoc(doc(db, "team_members", `${userId}_${userId}`), {
      teamId: userId,
      userId: userId,
      role: "admin",
      joinedAt: new Date().toISOString(),
    });

    console.log("Firestore schema initialized successfully");
  } catch (error) {
    console.error("Error initializing Firestore schema:", error);
  }
}

export { db };