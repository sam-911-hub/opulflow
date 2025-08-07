"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface User {
  email: string;
  name: string;
  phone: string;
  credits: Record<string, number>;
  services: string[];
}

export default function AdminCreditManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [credits, setCredits] = useState(0);
  const [service, setService] = useState("leads");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      console.log('Fetching users...');
      let response = await fetch('/api/admin/user-services');
      console.log('Admin API response status:', response.status);
      
      if (!response.ok) {
        console.log('Admin API failed, trying fallback...');
        response = await fetch('/api/users');
        console.log('Fallback API response status:', response.status);
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Fetched users data:', data);
      console.log('Users array length:', data.users?.length || 0);
      
      if (data.error) {
        console.error('API returned error:', data.error);
      }
      
      setUsers(data.users || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      console.log('Setting empty users array due to error');
      setUsers([]);
    }
  };

  const assignCredits = async () => {
    if (!selectedUser || !credits) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/admin/assign-credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: selectedUser,
          credits,
          service
        })
      });

      if (response.ok) {
        alert('Credits assigned successfully');
        fetchUsers();
        setCredits(0);
      } else {
        alert('Failed to assign credits');
      }
    } catch (error) {
      alert('Error assigning credits');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Assign Credits</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Select User ({users.length} users found)</label>
            <select 
              value={selectedUser} 
              onChange={(e) => {
                console.log('Selected user:', e.target.value);
                setSelectedUser(e.target.value);
              }}
              className="w-full p-2 border rounded"
            >
              <option value="">Select User</option>
              {users.length > 0 ? (
                users.map(user => (
                  <option key={user.email} value={user.email}>
                    {user.name} ({user.email})
                  </option>
                ))
              ) : (
                <option disabled>No users found</option>
              )}
            </select>
          </div>
          
          <select 
            value={service} 
            onChange={(e) => setService(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="leads">Lead Lookup</option>
            <option value="companies">Company Enrichment</option>
            <option value="emails">Email Verification</option>
            <option value="ai">AI Generation</option>
            <option value="techstack">Tech Stack Detection</option>
            <option value="intent">Intent Signals</option>
            <option value="calls">Call Analysis</option>
            <option value="crm">CRM Integration</option>
            <option value="workflows">Workflow Automation</option>
          </select>
          
          <input
            type="number"
            value={credits}
            onChange={(e) => setCredits(Number(e.target.value))}
            placeholder="Credits to assign"
            className="w-full p-2 border rounded"
          />
          
          <Button onClick={assignCredits} disabled={loading}>
            {loading ? 'Assigning...' : 'Assign Credits'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>User Services & Credits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border">
              <thead>
                <tr>
                  <th className="border p-2">Name</th>
                  <th className="border p-2">Email</th>
                  <th className="border p-2">Phone</th>
                  <th className="border p-2">Leads</th>
                  <th className="border p-2">Companies</th>
                  <th className="border p-2">Emails</th>
                  <th className="border p-2">AI</th>
                  <th className="border p-2">Tech</th>
                  <th className="border p-2">Intent</th>
                  <th className="border p-2">Calls</th>
                  <th className="border p-2">CRM</th>
                  <th className="border p-2">Workflows</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.email}>
                    <td className="border p-2">{user.name}</td>
                    <td className="border p-2">{user.email}</td>
                    <td className="border p-2">{user.phone}</td>
                    <td className="border p-2">{user.credits.leads || 0}</td>
                    <td className="border p-2">{user.credits.companies || 0}</td>
                    <td className="border p-2">{user.credits.emails || 0}</td>
                    <td className="border p-2">{user.credits.ai || 0}</td>
                    <td className="border p-2">{user.credits.techstack || 0}</td>
                    <td className="border p-2">{user.credits.intent || 0}</td>
                    <td className="border p-2">{user.credits.calls || 0}</td>
                    <td className="border p-2">{user.credits.crm || 0}</td>
                    <td className="border p-2">{user.credits.workflows || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}