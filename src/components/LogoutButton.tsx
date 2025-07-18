"use client";
import { Button } from "./ui/button";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function LogoutButton({ className = "" }: { className?: string }) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // Sign out from Firebase
      await signOut(auth);
      
      // Clear session cookie
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to clear session');
      }
      
      toast.success("Logged out successfully");
      
      // Use window.location for a full page refresh to clear any state
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to log out. Please try again.");
    }
  };

  return (
    <Button 
      onClick={handleLogout} 
      variant="ghost" 
      className={`text-red-600 hover:text-red-800 hover:bg-red-50 ${className}`}
    >
      <span className="mr-2">🚪</span> Logout
    </Button>
  );
}