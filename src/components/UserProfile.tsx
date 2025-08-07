"use client";
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/hooks/useProfile";
import ProfileSkeleton from "@/components/ProfileSkeleton";

export default function UserProfile() {
  const { user } = useAuth();
  const { profile, isLoading, updateProfile, isUpdating } = useProfile();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  // Update local state when profile data loads or changes
  React.useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setPhone(profile.phone || "");
    }
  }, [profile]);

  // Reset form after successful update
  React.useEffect(() => {
    if (!isUpdating && profile) {
      setName(profile.name || "");
      setPhone(profile.phone || "");
    }
  }, [isUpdating, profile]);

  const saveProfile = () => {
    updateProfile({ name: name.trim(), phone: phone.trim() });
  };

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="space-y-8">
      {/* Profile Display Section */}
      <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            👤 Account Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="bg-gradient-to-r from-gray-50 to-white p-6 rounded-2xl border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center md:text-left">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">✉️</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Email</p>
                </div>
                <p className="text-lg font-bold text-gray-900">{user?.email || 'Not set'}</p>
              </div>
              <div className="text-center md:text-left">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">👤</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Full Name</p>
                </div>
                <p className="text-lg font-bold text-gray-900">{profile?.name || name || 'Not set'}</p>
              </div>
              <div className="text-center md:text-left">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">📞</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Phone Number</p>
                </div>
                <p className="text-lg font-bold text-gray-900">{profile?.phone || phone || 'Not set'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Edit Section */}
      <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            ✏️ Edit Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Email Address</label>
            <input
              type="email"
              value={user?.email || ""}
              disabled
              className="w-full p-4 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-600 font-medium"
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Full Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 font-medium"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Phone Number *</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter your phone number"
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 font-medium"
              required
            />
          </div>
          
          <div className="pt-4">
            <Button 
              onClick={saveProfile} 
              disabled={isUpdating || !name.trim() || !phone.trim()}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isUpdating ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                  Saving Profile...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  💾 Save Profile
                </div>
              )}
            </Button>
            
            {(!name.trim() || !phone.trim()) && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-600 font-medium flex items-center gap-2">
                  ⚠️ Name and phone number are required
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}