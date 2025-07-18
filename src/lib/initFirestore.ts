import { collection, doc, setDoc } from "firebase/firestore";
import { db } from "./firebase";

// Helper function to initialize schema
export async function initFirestoreSchema(userId: string) {
  try {
    // Create user document if not exists
    await setDoc(doc(db, "users", userId), {
      email: "",
      accountType: "free",
      credits: {
        ai_email: 0,
        lead_lookup: 0,
        company_enrichment: 0,
        email_verification: 0,
        workflow: 0,
        crm_sync: 0
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

// No need to export db as it's already exported from firebase.ts