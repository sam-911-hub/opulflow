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
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Sign Out</h3>
            <p className="text-gray-600 mb-6">End your current session securely.</p>
            
            <LogoutButton className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white" />
          </div>
          
          <div className="mt-8 pt-6 border-t text-sm text-gray-500">
            <p>Your session will be securely ended and you will be redirected to the home page.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}