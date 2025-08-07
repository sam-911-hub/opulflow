"use client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Button } from "./ui/button";

export default function ProFeatureGuard({ children }: { children: React.ReactNode }) {
  const { accountType } = useAuth();

  if (accountType !== "pro") {
    return (
      <div className="p-4 border rounded-lg bg-gray-50 text-center space-y-2">
        <p>This feature requires a Pro subscription</p>
        <Button onClick={() => toast.info("Redirecting to upgrade...")}>
          Upgrade Now
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}