"use client";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function LogoutButton({ className = "" }: { className?: string }) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const [{ signOut }, { auth }] = await Promise.all([
        import('firebase/auth'),
        import('@/lib/firebase')
      ]);
      
      await Promise.all([
        signOut(auth),
        fetch('/api/auth/logout', { method: 'POST' })
      ]);
      
      toast.success("You have been successfully signed out");
      router.replace("/");
    } catch (error) {
      toast.error("Unable to sign out. Please try again.");
    }
  };

  return (
    <Button 
      onClick={handleLogout} 
      variant="ghost" 
      className={`text-red-600 hover:text-red-800 hover:bg-red-50 ${className}`}
    >
      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
      </svg>
      Sign Out
    </Button>
  );
}