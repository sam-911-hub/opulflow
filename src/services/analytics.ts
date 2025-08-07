import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { subDays } from "date-fns";

export const getUserActivity = async (userId: string) => {
  const q = query(
    collection(db, `users/${userId}/transactions`),
    where("createdAt", ">=", subDays(new Date(), 30).toISOString())
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data());
};

export const getCreditUsage = async (userId: string) => {
  const activity = await getUserActivity(userId);
  return activity.reduce((acc, item) => {
    if (item.type === "consumption") {
      acc[item.service] = (acc[item.service] || 0) + item.amount;
    }
    return acc;
  }, {} as Record<string, number>);
};