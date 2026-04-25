import { collection, addDoc, getDocs } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebaseClient";

export async function testFirestoreConnection() {
  try {
    console.log("🔍 Testing Firestore connection...");

    const db = getFirebaseDb();
    console.log("✅ Firestore instance created");

    // Try to read from a collection that should exist
    const testCollection = collection(db, "users");
    console.log("✅ Collection reference created");

    // Try to get documents (this will fail if Firestore is not accessible)
    const querySnapshot = await getDocs(testCollection);
    console.log("✅ Successfully read from Firestore");
    console.log("📊 Found", querySnapshot.size, "user documents");

    // Try to write a test document (will be rejected by rules but shows connectivity)
    try {
      const testDoc = await addDoc(collection(db, "test"), {
        test: true,
        timestamp: new Date()
      });
      console.log("✅ Successfully wrote to Firestore (this should be rejected by rules)");
    } catch (writeError: any) {
      if (writeError.code === 'permission-denied') {
        console.log("✅ Firestore security rules are active (write rejected as expected)");
      } else {
        console.log("⚠️ Unexpected write error:", writeError);
      }
    }

    return { success: true, message: "Firestore is connected and working" };

  } catch (error: any) {
    console.error("❌ Firestore connection test failed:", error);

    if (error.code === 'unavailable') {
      return {
        success: false,
        message: "Firestore is not available. Check if database is enabled.",
        suggestion: "Go to Firebase Console → Firestore Database → Create database"
      };
    }

    if (error.code === 'permission-denied') {
      return {
        success: false,
        message: "Permission denied. Check security rules.",
        suggestion: "Deploy Firestore rules: firebase deploy --only firestore:rules"
      };
    }

    if (error.code === 'not-found') {
      return {
        success: false,
        message: "Firestore database not found.",
        suggestion: "Create Firestore database in Firebase Console"
      };
    }

    return {
      success: false,
      message: `Firestore error: ${error.message}`,
      suggestion: "Check Firebase configuration and network connectivity"
    };
  }
}