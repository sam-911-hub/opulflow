import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

// Trigger when a new user is created in Firebase Auth
export const createUserDocument = functions.auth.user().onCreate(async (user) => {
  try {
    console.log('Creating user document for:', user.uid, user.email);

    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: user.email?.split('@')[0] || '',
      credits: 20, // Free credits for new users
      accountType: 'free',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastLogin: admin.firestore.FieldValue.serverTimestamp(),
    };

    // Create user document in Firestore
    await admin.firestore().collection('users').doc(user.uid).set(userData);

    console.log('User document created successfully for:', user.uid);

    // Optional: Send welcome email (if you have email service configured)
    // You could integrate with your email service here

  } catch (error) {
    console.error('Error creating user document:', error);
    // You might want to send an alert or log to monitoring service
    throw new functions.https.HttpsError('internal', 'Failed to create user profile');
  }
});

// Optional: Function to update last login
export const updateLastLogin = functions.auth.user().onCreate(async (user) => {
  try {
    await admin.firestore().collection('users').doc(user.uid).update({
      lastLogin: admin.firestore.FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating last login:', error);
  }
});