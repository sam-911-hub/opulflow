"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileOverview() {
  const { user } = useAuth();
  const { profile, isLoading } = useProfile();

  if (isLoading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
          <Skeleton className="h-6 w-32 bg-white/20" />
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="text-center">
                <Skeleton className="h-4 w-16 mb-2 mx-auto" />
                <Skeleton className="h-6 w-24 mx-auto" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          👤 Your Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✉</span>
              </div>
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Email</p>
            </div>
            <p className="text-lg font-bold text-gray-900">{user?.email}</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">👤</span>
              </div>
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Name</p>
            </div>
            <p className="text-lg font-bold text-gray-900">
              {profile?.name || (
                <span className="text-gray-400 italic">Please update your profile</span>
              )}
            </p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">📞</span>
              </div>
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Phone</p>
            </div>
            <p className="text-lg font-bold text-gray-900">
              {profile?.phone || (
                <span className="text-gray-400 italic">Please update your profile</span>
              )}
            </p>
          </div>
        </div>
        
        {(!profile?.name || !profile?.phone) && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-center">
            <p className="text-sm text-amber-700 font-medium">
              📝 Complete your profile in Settings to get the most out of OpulFlow
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}