import { db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp, updateDoc, doc } from "firebase/firestore";

export const sendNotification = async (userId: string, message: string, type: string = 'info') => {
  await addDoc(collection(db, `users/${userId}/notifications`), {
    message,
    type,
    read: false,
    createdAt: serverTimestamp()
  });
};

export const markAsRead = async (userId: string, notificationId: string) => {
  await updateDoc(doc(db, `users/${userId}/notifications/${notificationId}`), {
    read: true
  });
};