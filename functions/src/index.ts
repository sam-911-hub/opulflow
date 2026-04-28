import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { onCall } from 'firebase-functions/v2/https';
import { onRequest } from 'firebase-functions/v2/https';
import { onDocumentWritten } from 'firebase-functions/v2/firestore';
import { beforeUserCreated, beforeUserSignedIn, HttpsError } from 'firebase-functions/v2/identity';
import { onDocumentCreated as onUserDocCreated } from 'firebase-functions/v2/firestore';
import { user } from 'firebase-functions/v1/auth';
import * as admin from 'firebase-admin';

admin.initializeApp();

// Cloud Function triggered when a new user is created in Firebase Auth
export const createUserDocument = user().onCreate(async (userRecord: any, context: any) => {
  try {
    const user = userRecord;
    console.log('Creating user document for:', user.uid, user.email);

    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || user.email?.split('@')[0] || '',
      credits: 20,
      freeCreditsGiven: true,
      accountType: 'free',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastLogin: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Create user document in Firestore
    await admin.firestore().collection('users').doc(user.uid).set(userData);

    console.log('✅ User document created successfully for:', user.uid, 'with 20 credits');

  } catch (error) {
    console.error('❌ Error creating user document:', error);
    // Log to monitoring service if available
    throw new Error('Failed to create user profile');
  }
});