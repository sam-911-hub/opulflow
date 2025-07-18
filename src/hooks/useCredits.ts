import { useAuth } from "@/context/AuthContext";
import { doc, updateDoc, collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import { CreditType } from "@/types/interfaces";

export default function useCredits() {
  const { user } = useAuth();

  const deductCredits = async (service: CreditType, amount: number) => {
    if (!user) {
      toast.error("You need to be logged in");
      return false;
    }

    const currentBalance = (user as any)?.credits?.[service] ?? 0;
    if (currentBalance < amount) {
      toast.error(`Not enough ${service} credits`);
      return false;
    }

    try {
      // Update balance
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        [`credits.${service}`]: currentBalance - amount
      });

      // Record transaction
      await addDoc(collection(db, `users/${user.uid}/transactions`), {
        type: "consumption",
        amount: amount,
        service,
        createdAt: new Date().toISOString(),
        remainingBalance: currentBalance - amount
      });

      return true;
    } catch (error) {
      console.error('Error deducting credits:', error);
      toast.error("Failed to deduct credits. Please try again.");
      return false;
    }
  };

  const addCredits = async (service: CreditType, amount: number) => {
    if (!user) {
      toast.error("You need to be logged in");
      return false;
    }

    try {
      const currentBalance = (user as any)?.credits?.[service] ?? 0;
      
      // Update balance
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        [`credits.${service}`]: currentBalance + amount
      });

      // Record transaction
      await addDoc(collection(db, `users/${user.uid}/transactions`), {
        type: "purchase",
        amount: amount,
        service,
        createdAt: new Date().toISOString(),
        remainingBalance: currentBalance + amount
      });

      toast.success(`Added ${amount} ${service} credits`);
      return true;
    } catch (error) {
      console.error('Error adding credits:', error);
      toast.error("Failed to add credits. Please try again.");
      return false;
    }
  };

  return { deductCredits, addCredits };
}