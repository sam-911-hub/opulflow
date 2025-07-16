"use client";
import { creditPackages, CreditPackage } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { doc, updateDoc, collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "./ui/card";

export default function CreditPurchase() {
  const { user } = useAuth();

  const purchaseCredits = async (packageItem: CreditPackage) => {
    if (!user) {
      toast.error("You need to be logged in");
      return;
    }

    try {
      // Update user's credit balance
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        [`credits.${packageItem.type}`]: ((user as any)?.credits?.[packageItem.type] || 0) + packageItem.amount
      });

      // Record transaction
      await addDoc(collection(db, `users/${user.uid}/transactions`), {
        type: "purchase",
        amount: packageItem.amount,
        service: packageItem.type,
        createdAt: new Date().toISOString(),
        remainingBalance: ((user as any)?.credits?.[packageItem.type] || 0) + packageItem.amount
      });

      toast.success(`Purchased ${packageItem.description}`);
      // Refresh the page to update user data
      window.location.reload();
    } catch (error) {
      console.error('Purchase error:', error);
      toast.error("Failed to purchase credits");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Buy Credits</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {creditPackages.map((packageItem) => (
          <Card key={packageItem.id}>
            <CardHeader>
              <CardTitle>{packageItem.description}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">{packageItem.amount} Credits</p>
              <p className="text-2xl font-bold">${packageItem.price}</p>
            </CardContent>
            <CardFooter>
              <Button onClick={() => purchaseCredits(packageItem)}>
                Purchase
              </Button>
            </CardFooter>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
}