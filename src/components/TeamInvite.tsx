"use client";
import { useState } from "react";
import { collection, addDoc, where, query, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export default function TeamInvite() {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const sendInvite = async () => {
    if (!email) {
      toast.error("Please enter an email");
      return;
    }

    setLoading(true);
    try {
      // Check if user exists
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        toast.error("No user found with that email");
        return;
      }

      const invitedUser = querySnapshot.docs[0].data();
      
      // Add to team (simplified - in real app you'd send an email invite)
      await addDoc(collection(db, "team_members"), {
        teamId: user?.uid, // Using user ID as team ID for simplicity
        userId: invitedUser.uid,
        role: "member",
        joinedAt: new Date().toISOString(),
      });

      toast.success(`Invite sent to ${email}`);
      setEmail("");
    } catch (error) {
      toast.error("Failed to send invite");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Input
        type="email"
        placeholder="Enter team member's email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Button onClick={sendInvite} disabled={loading}>
        {loading ? "Sending..." : "Invite"}
      </Button>
    </div>
  );
}