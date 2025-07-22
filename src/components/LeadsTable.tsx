import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Lead } from '@/types';

interface LeadsTableProps {
  onLeadSelect?: (lead: Lead) => void;
}

export default function LeadsTable({ onLeadSelect }: LeadsTableProps) {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [newLead, setNewLead] = useState<Omit<Lead, 'id'>>({
    name: '',
    email: '',
    company: '',
    title: '',
    phone: '',
    status: 'new',
    notes: '',
    createdAt: new Date().toISOString()
  });
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchLeads = async () => {
    if (!user?.uid) return;
    
    try {
      const leadsRef = collection(db, `users/${user.uid}/leads`);
      const querySnapshot = await getDocs(leadsRef);
      setLeads(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lead)));
    } catch (err) {
      console.error('Error fetching leads:', err);
      toast.error('Failed to fetch leads');
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [user?.uid, fetchLeads]);

  const handleAddLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) return;
    
    try {
      setLoading(true);
      const leadsRef = collection(db, `users/${user.uid}/leads`);
      await addDoc(leadsRef, {
        ...newLead,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      setNewLead({
        name: '',
        email: '',
        company: '',
        title: '',
        phone: '',
        status: 'new',
        notes: '',
        createdAt: new Date().toISOString()
      });
      
      await fetchLeads();
      toast.success('Lead added successfully');
    } catch (err) {
      console.error('Error adding lead:', err);
      toast.error('Failed to add lead');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLead = async (leadId: string, updates: Partial<Lead>) => {
    if (!user?.uid) return;
    
    try {
      const leadRef = doc(db, `users/${user.uid}/leads`, leadId);
      await updateDoc(leadRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
      
      await fetchLeads();
      toast.success('Lead updated successfully');
      setEditingLead(null);
    } catch (err) {
      console.error('Error updating lead:', err);
      toast.error('Failed to update lead');
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    if (!user?.uid) return;
    
    try {
      const leadRef = doc(db, `users/${user.uid}/leads`, leadId);
      await deleteDoc(leadRef);
      await fetchLeads();
      toast.success('Lead deleted successfully');
    } catch (err) {
      console.error('Error deleting lead:', err);
      toast.error('Failed to delete lead');
    }
  };

  const handleStatusChange = async (leadId: string, newStatus: Lead['status']) => {
    await handleUpdateLead(leadId, { status: newStatus });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLead) return;
    
    await handleUpdateLead(editingLead.id, editingLead);
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Company', 'Title', 'Phone', 'Status', 'Notes', 'Created At'];
    const csvContent = [
      headers.join(','),
      ...leads.map((lead: Lead) => [
        lead.name,
        lead.email,
        lead.company,
        lead.title || '',
        lead.phone || '',
        lead.status,
        lead.notes || '',
        lead.createdAt
      ].map(field => `"${field}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leads.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importFromCSV = async (file: File) => {
    if (!user?.uid) return;
    
    try {
      const text = await file.text();
      const lines = text.split('\n');
      const headers = lines[0].split(',');
      
      const leadsToImport = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.replace(/"/g, ''));
        return {
          name: values[0] || '',
          email: values[1] || '',
          company: values[2] || '',
          title: values[3] || '',
          phone: values[4] || '',
          status: (values[5] as Lead['status']) || 'new',
          notes: values[6] || '',
          createdAt: new Date().toISOString()
        };
      }).filter(lead => lead.name && lead.email);
      
      const leadsRef = collection(db, `users/${user.uid}/leads`);
      for (const lead of leadsToImport) {
        await addDoc(leadsRef, lead);
      }
      
      await fetchLeads();
      toast.success(`Imported ${leadsToImport.length} leads`);
    } catch (err) {
      console.error('Error importing leads:', err);
      toast.error('Failed to import leads');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leads Management</CardTitle>
        <div className="flex gap-2">
          <Button onClick={exportToCSV}>Export CSV</Button>
          <Input
            type="file"
            accept=".csv"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) importFromCSV(file);
            }}
            className="w-auto"
          />
        </div>
      </CardHeader>
      <CardContent>
        {/* Add Lead Form */}
        <form onSubmit={handleAddLead} className="mb-6 grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={newLead.name}
              onChange={(e) => setNewLead({...newLead, name: e.target.value})}
              required
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={newLead.email}
              onChange={(e) => setNewLead({...newLead, email: e.target.value})}
              required
            />
          </div>
          <div>
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              value={newLead.company}
              onChange={(e) => setNewLead({...newLead, company: e.target.value})}
              required
            />
          </div>
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={newLead.title}
              onChange={(e) => setNewLead({...newLead, title: e.target.value})}
            />
          </div>
          <div className="col-span-2">
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Lead'}
            </Button>
          </div>
        </form>

        {/* Leads Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-200 p-2 text-left">Name</th>
                <th className="border border-gray-200 p-2 text-left">Email</th>
                <th className="border border-gray-200 p-2 text-left">Company</th>
                <th className="border border-gray-200 p-2 text-left">Status</th>
                <th className="border border-gray-200 p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50">
                  <td className="border border-gray-200 p-2">{lead.name}</td>
                  <td className="border border-gray-200 p-2">{lead.email}</td>
                  <td className="border border-gray-200 p-2">{lead.company}</td>
                  <td className="border border-gray-200 p-2">
                    <select
                      value={lead.status}
                      onChange={(e) => handleStatusChange(lead.id, e.target.value as Lead['status'])}
                      className="border rounded px-2 py-1"
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="qualified">Qualified</option>
                      <option value="lost">Lost</option>
                    </select>
                  </td>
                  <td className="border border-gray-200 p-2">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingLead(lead)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteLead(lead.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      {onLeadSelect && (
                        <Button
                          size="sm"
                          onClick={() => onLeadSelect(lead)}
                        >
                          Select
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Edit Lead Modal */}
        {editingLead && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Edit Lead</h3>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="edit-name">Name</Label>
                  <Input
                    id="edit-name"
                    value={editingLead.name}
                    onChange={(e) => setEditingLead({...editingLead, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editingLead.email}
                    onChange={(e) => setEditingLead({...editingLead, email: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-company">Company</Label>
                  <Input
                    id="edit-company"
                    value={editingLead.company}
                    onChange={(e) => setEditingLead({...editingLead, company: e.target.value})}
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Save</Button>
                  <Button type="button" variant="outline" onClick={() => setEditingLead(null)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}