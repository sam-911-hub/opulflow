import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export type NotificationType = 'info' | 'warning' | 'success' | 'error';

/**
 * Send a notification to a user
 * @param userId User ID
 * @param message Notification message
 * @param type Notification type
 * @returns Promise<string> ID of the notification
 */
export async function sendNotification(
  userId: string,
  message: string,
  type: NotificationType = 'info'
): Promise<string> {
  try {
    const notificationRef = await addDoc(collection(db, `users/${userId}/notifications`), {
      message,
      type,
      read: false,
      createdAt: serverTimestamp()
    });
    
    return notificationRef.id;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
}

/**
 * Mark a notification as read
 * @param userId User ID
 * @param notificationId Notification ID
 * @returns Promise<void>
 */
export async function markNotificationAsRead(
  userId: string,
  notificationId: string
): Promise<void> {
  try {
    await updateDoc(doc(db, `users/${userId}/notifications/${notificationId}`), {
      read: true,
      readAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
}

/**
 * Mark all notifications as read for a user
 * @param userId User ID
 * @returns Promise<void>
 */
export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  try {
    const notificationsRef = collection(db, `users/${userId}/notifications`);
    const q = query(notificationsRef, where("read", "==", false));
    const querySnapshot = await getDocs(q);
    
    const batch = writeBatch(db);
    
    querySnapshot.docs.forEach(doc => {
      batch.update(doc.ref, {
        read: true,
        readAt: serverTimestamp()
      });
    });
    
    await batch.commit();
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
}