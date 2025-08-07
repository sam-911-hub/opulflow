"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function ProfileRequiredModal() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.email) {
      checkProfile();
    }
  }, [user]);

  const checkProfile = async () => {
    try {
      const response = await fetch(`/api/user/profile?email=${user?.email}`);
      if (response.ok) {
        const data = await response.json();
        if (!data.name || !data.phone) {
          setIsOpen(true);
        }
      }
    } catch (error) {
      console.error('Failed to check profile:', error);
    }
  };

  const saveProfile = async () => {
    if (!name.trim() || !phone.trim()) return;
    
    setSaving(true);
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user?.email,
          name: name.trim(),
          phone: phone.trim()
        })
      });

      if (response.ok) {
        setIsOpen(false);
      } else {
        alert('Failed to save profile');
      }
    } catch (error) {
      alert('Error saving profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Complete Your Profile</DialogTitle>
          <DialogDescription>
            Please provide your name and phone number to continue using OpulFlow.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          
          <div>
            <label className="block text-sm font-medium mb-1">Full Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full p-2 border rounded"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Phone Number *</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter your phone number"
              className="w-full p-2 border rounded"
              required
            />
          </div>
          
          <Button 
            onClick={saveProfile} 
            disabled={saving || !name.trim() || !phone.trim()}
            className="w-full"
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}