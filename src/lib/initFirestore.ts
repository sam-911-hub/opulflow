import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

export async function initFirestoreSchema(userId: string) {
  try {
    // Initialize team document
    const teamRef = doc(db, 'teams', userId);
    const teamDoc = await getDoc(teamRef);
    
    if (!teamDoc.exists()) {
      await setDoc(teamRef, {
        name: 'Personal Team',
        ownerId: userId,
        members: [userId],
        createdAt: new Date().toISOString(),
        settings: {
          allowInvites: true,
          maxMembers: 5
        }
      });
    }

    // Initialize member document
    const memberRef = doc(db, 'members', userId);
    const memberDoc = await getDoc(memberRef);
    
    if (!memberDoc.exists()) {
      await setDoc(memberRef, {
        userId,
        teamId: userId,
        role: 'owner',
        permissions: ['all'],
        joinedAt: new Date().toISOString()
      });
    }

    return true;
  } catch (error) {
    console.error('Error initializing Firestore schema:', error);
    throw error;
  }
}