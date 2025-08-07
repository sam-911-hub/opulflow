"use client";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import LogoutButton from "@/components/LogoutButton";

export default function LogoutTab() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Logout</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-red-600 text-2xl">🚪</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Ready to sign out?</h3>
            <p className="text-gray-600 mb-6">You can always log back in anytime.</p>
            
            <LogoutButton className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white" />
          </div>
          
          <div className="mt-8 pt-6 border-t text-sm text-gray-500">
            <p>Your session will be ended and you'll be redirected to the welcome page.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}