"use client";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { collection, addDoc, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function EmailSequences() {
  const { user } = useAuth();
  const [sequences, setSequences] = useState<any[]>([]);
  const [newSequenceName, setNewSequenceName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) fetchSequences();
  }, [user]);

  const fetchSequences = async () => {
    try {
      const q = query(
        collection(db, `users/${user?.uid}/emailSequences`),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      const sequencesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSequences(sequencesData);
    } catch (error) {
      console.error("Error fetching sequences:", error);
    }
  };

  const createSequence = async () => {
    if (!newSequenceName.trim()) {
      toast.error("Please enter a sequence name");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, `users/${user?.uid}/emailSequences`), {
        name: newSequenceName,
        emails: 1,
        active: true,
        createdAt: new Date().toISOString(),
        lastSent: null
      });
      toast.success("Email sequence created successfully!");
      setNewSequenceName("");
      fetchSequences();
    } catch (error) {
      console.error("Error creating sequence:", error);
      toast.error("Failed to create sequence");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 mb-4">
        <Input
          placeholder="Enter sequence name..."
          value={newSequenceName}
          onChange={(e) => setNewSequenceName(e.target.value)}
        />
        <Button onClick={createSequence} disabled={loading}>
          {loading ? "Creating..." : "Create Sequence"}
        </Button>
      </div>
      
      <div className="grid gap-4">
        {sequences.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No email sequences created yet</p>
            <p className="text-sm">Create your first sequence above</p>
          </div>
        ) : (
          sequences.map((sequence) => (
            <Card key={sequence.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">{sequence.name}</h4>
                    <p className="text-sm text-gray-500">{sequence.emails || 1} emails</p>
                    <p className="text-xs text-gray-400">Created: {new Date(sequence.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs ${
                    sequence.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {sequence.active ? 'Active' : 'Draft'}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}