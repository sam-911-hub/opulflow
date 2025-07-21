import { db } from './firebase';
import { collection, addDoc, serverTimestamp, updateDoc, doc, query, where, getDocs, writeBatch } from 'firebase/firestore';

export interface Notification {
  id?: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  createdAt: any;
}

// Create a new notification for a user
export async function createNotification(
  userId: string,
  title: string,
  message: string,
  type: 'info' | 'warning' | 'error' | 'success' = 'info'
): Promise<string> {
  try {
    const notificationRef = await addDoc(collection(db, `users/${userId}/notifications`), {
      title,
      message,
      type,
      read: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    console.log(`Notification created for user ${userId}: ${title}`);
    return notificationRef.id;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}

// Mark a notification as read
export async function markNotificationAsRead(
  userId: string,
  notificationId: string
): Promise<void> {
  try {
    await updateDoc(doc(db, `users/${userId}/notifications/${notificationId}`), {
      read: true,
      readAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    console.log(`Notification ${notificationId} marked as read for user ${userId}`);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
}

// Mark all notifications as read for a user
export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  try {
    const notificationsRef = collection(db, `users/${userId}/notifications`);
    const q = query(notificationsRef, where("read", "==", false));
    const querySnapshot = await getDocs(q);

    const batch = writeBatch(db);

    querySnapshot.docs.forEach((doc: any) => {
      batch.update(doc.ref, {
        read: true,
        readAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    });

    await batch.commit();
    console.log(`All notifications marked as read for user ${userId}`);
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
}