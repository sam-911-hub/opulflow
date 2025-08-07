"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";

// Updated type definition for API keys
type APIKey = {
  id: string;
  name: string;
  keyPreview: string;
  createdAt: string;
  lastUsed?: string;
  active: boolean;
};

export default function ApiKeyManager() {
  const [keys, setKeys] = useState<APIKey[]>([]);
  const [keyName, setKeyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newKeyData, setNewKeyData] = useState<{id: string, name: string, key: string} | null>(null);

  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {    
    try {
      setLoading(true);
      const response = await fetch('/api/keys/list');
      
      if (!response.ok) {
        throw new Error('Failed to fetch API keys');
      }
      
      const data = await response.json();
      setKeys(data.apiKeys || []);
    } catch (error) {
      console.error('Error fetching API keys:', error);
      toast.error("Failed to load API keys");
    } finally {
      setLoading(false);
    }
  };

  const createKey = async () => {
    if (!keyName) {
      toast.error("Please enter a name for your API key");
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch('/api/keys/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: keyName }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create API key');
      }
      
      const data = await response.json();
      setNewKeyData({
        id: data.id,
        name: data.name,
        key: data.key
      });
      toast.success("API key created successfully");
      setKeyName("");
      fetchKeys();
    } catch (error) {
      toast.error("Failed to create API key");
    } finally {
      setIsCreating(false);
    }
  };

  const revokeKey = async (keyId: string) => {
    try {
      const response = await fetch('/api/keys/revoke', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keyId }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to revoke API key');
      }
      
      toast.success("API key revoked");
      fetchKeys();
    } catch (error) {
      toast.error("Failed to revoke API key");
    }
  };

  return (
    <div className="space-y-6">
      {newKeyData && (
        <Card className="border-2 border-green-500 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-700">API Key Created</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-green-800">Name:</p>
                <p>{newKeyData.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-green-800">API Key:</p>
                <div className="flex items-center gap-2">
                  <code className="bg-white p-2 rounded border flex-1 font-mono text-sm overflow-x-auto">
                    {newKeyData.key}
                  </code>
                  <Button 
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(newKeyData.key);
                      toast.success("API key copied to clipboard");
                    }}
                  >
                    Copy
                  </Button>
                </div>
              </div>
              <div className="bg-yellow-100 p-3 rounded-md text-yellow-800 text-sm">
                <p className="font-medium">Important:</p>
                <p>This key will only be shown once. Please save it somewhere safe.</p>
              </div>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setNewKeyData(null)}
              >
                Done
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Manage API Keys</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
                placeholder="API Key Name"
                className="flex-1"
              />
              <Button onClick={createKey} disabled={isCreating}>
                {isCreating ? "Creating..." : "Create Key"}
              </Button>
            </div>
            
            {loading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : keys.length > 0 ? (
              <div className="space-y-2">
                <h3 className="font-medium">Your API Keys</h3>
                <div className="border rounded-md divide-y">
                  {keys.map((key) => (
                    <div key={key.id} className="p-3 flex justify-between items-center">
                      <div>
                        <div className="font-medium">{key.name}</div>
                        <div className="text-sm text-gray-500">
                          <span className="font-mono">{key.keyPreview}</span>
                          <span className="mx-2">•</span>
                          <span>{new Date(key.createdAt).toLocaleDateString()}</span>
                          {!key.active && (
                            <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">
                              Revoked
                            </span>
                          )}
                        </div>
                      </div>
                      {key.active && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => revokeKey(key.id)}
                        >
                          Revoke
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                No API keys found. Create one to get started.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}