"use client";
import { useState, useEffect } from "react";
import { doc, collection, getDocs, addDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";

// Add this type definition right here in the file
type APIKey = {
  id: string;
  service: 'openai' | 'salesforce' | 'hubspot' | 'zapier';
  key: string;
  createdAt: string;
  lastUsed?: string;
};

export default function ApiKeyManager() {
  const { user } = useAuth();
  const [keys, setKeys] = useState<APIKey[]>([]);
  const [newKey, setNewKey] = useState("");
  const [service, setService] = useState<APIKey['service']>("openai");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.uid) {
      fetchKeys();
    }
  }, [user?.uid]);

  const fetchKeys = async () => {
    if (!user?.uid) {
      console.error('No user UID available for fetching API keys');
      return;
    }
    
    try {
      console.log('Fetching API keys for user:', user.uid);
      const querySnapshot = await getDocs(
        collection(db, `users/${user.uid}/apiKeys`)
      );
      const fetchedKeys = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as APIKey));
      console.log('Fetched API keys:', fetchedKeys.length);
      setKeys(fetchedKeys);
    } catch (error) {
      console.error('Error fetching API keys:', error);
      toast.error("Failed to load API keys");
    }
  };

  const addKey = async () => {
    if (!newKey || !service) {
      toast.error("Please fill all fields");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, `users/${user?.uid}/apiKeys`), {
        service,
        key: newKey,
        createdAt: new Date().toISOString(),
      });
      toast.success("API key added successfully");
      setNewKey("");
      fetchKeys();
    } catch (error) {
      toast.error("Failed to add API key");
    } finally {
      setLoading(false);
    }
  };

  const deleteKey = async (id: string) => {
    try {
      await deleteDoc(doc(db, `users/${user?.uid}/apiKeys`, id));
      toast.success("API key deleted");
      fetchKeys();
    } catch (error) {
      toast.error("Failed to delete API key");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage API Keys</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <select
              value={service}
              onChange={(e) => setService(e.target.value as APIKey['service'])}
              className="border rounded-md p-2"
            >
              <option value="openai">OpenAI</option>
              <option value="salesforce">Salesforce</option>
              <option value="hubspot">HubSpot</option>
              <option value="zapier">Zapier</option>
            </select>
            <Input
              type="password"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              placeholder="Enter API key"
            />
            <Button onClick={addKey} disabled={loading}>
              {loading ? "Adding..." : "Add Key"}
            </Button>
          </div>
          
          {keys.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium">Your Keys</h3>
              <div className="border rounded-md divide-y">
                {keys.map((key) => (
                  <div key={key.id} className="p-3 flex justify-between items-center">
                    <div>
                      <span className="font-medium capitalize">{key.service}</span>
                      <span className="text-sm text-gray-500 ml-2">
                        {new Date(key.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteKey(key.id)}
                    >
                      Delete
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}