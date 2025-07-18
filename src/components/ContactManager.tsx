'use client';
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { toast } from 'sonner';

type Contact = {
  id: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  createdAt: string;
};

type PaginationInfo = {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
};

export default function ContactManager() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    limit: 50,
    offset: 0,
    hasMore: false,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  // Form state for new contact
  const [newContact, setNewContact] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
  });
  
  // Fetch contacts
  const fetchContacts = async (offset = 0, search = '') => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: pagination.limit.toString(),
        offset: offset.toString(),
      });
      
      if (search) {
        params.append('search', search);
      }
      
      const response = await fetch(`/api/contacts?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch contacts');
      }
      
      const data = await response.json();
      setContacts(data.contacts);
      setPagination(data.pagination);
      setError(null);
    } catch (err) {
      console.error('Error fetching contacts:', err);
      setError('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };
  
  // Initial fetch
  useEffect(() => {
    fetchContacts();
  }, []);
  
  // Handle search
  const handleSearch = () => {
    fetchContacts(0, searchTerm);
  };
  
  // Handle pagination
  const handleNextPage = () => {
    if (pagination.hasMore) {
      const newOffset = pagination.offset + pagination.limit;
      fetchContacts(newOffset, searchTerm);
    }
  };
  
  const handlePrevPage = () => {
    if (pagination.offset > 0) {
      const newOffset = Math.max(0, pagination.offset - pagination.limit);
      fetchContacts(newOffset, searchTerm);
    }
  };
  
  // Handle new contact form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewContact(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCreateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newContact.name || !newContact.email) {
      toast.error('Name and email are required');
      return;
    }
    
    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newContact),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create contact');
      }
      
      const data = await response.json();
      toast.success('Contact created successfully');
      
      // Reset form and refresh contacts
      setNewContact({
        name: '',
        email: '',
        company: '',
        phone: '',
      });
      fetchContacts(pagination.offset, searchTerm);
    } catch (err) {
      console.error('Error creating contact:', err);
      toast.error('Failed to create contact');
    }
  };
  
  // Handle import
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Only accept CSV files
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }
    
    try {
      setIsImporting(true);
      
      // Read file
      const text = await file.text();
      const lines = text.split('\n');
      const headers = lines[0].split(',');
      
      // Find column indices
      const nameIndex = headers.findIndex(h => h.toLowerCase().includes('name'));
      const emailIndex = headers.findIndex(h => h.toLowerCase().includes('email'));
      const companyIndex = headers.findIndex(h => h.toLowerCase().includes('company'));
      const phoneIndex = headers.findIndex(h => h.toLowerCase().includes('phone'));
      
      if (emailIndex === -1) {
        toast.error('CSV must contain an email column');
        return;
      }
      
      // Parse contacts
      const contacts = [];
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        const values = lines[i].split(',');
        contacts.push({
          name: nameIndex !== -1 ? values[nameIndex]?.trim() : '',
          email: values[emailIndex]?.trim(),
          company: companyIndex !== -1 ? values[companyIndex]?.trim() : '',
          phone: phoneIndex !== -1 ? values[phoneIndex]?.trim() : '',
        });
      }
      
      // Import contacts
      const response = await fetch('/api/contacts/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contacts }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to import contacts');
      }
      
      const data = await response.json();
      toast.success(`Imported ${data.imported} contacts successfully`);
      
      // Refresh contacts
      fetchContacts();
    } catch (err) {
      console.error('Error importing contacts:', err);
      toast.error('Failed to import contacts');
    } finally {
      setIsImporting(false);
      // Reset file input
      e.target.value = '';
    }
  };
  
  // Handle export
  const handleExport = async () => {
    try {
      setIsExporting(true);
      
      // Export as CSV
      const response = await fetch('/api/contacts/export?format=csv');
      
      if (!response.ok) {
        throw new Error('Failed to export contacts');
      }
      
      // Download file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `contacts_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Contacts exported successfully');
    } catch (err) {
      console.error('Error exporting contacts:', err);
      toast.error('Failed to export contacts');
    } finally {
      setIsExporting(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Contact Management</h2>
        <div className="flex space-x-2">
          <label className="cursor-pointer">
            <Input
              type="file"
              accept=".csv"
              onChange={handleImport}
              disabled={isImporting}
              className="hidden"
            />
            <Button
              variant="outline"
              disabled={isImporting}
              className="flex items-center gap-2"
              onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
            >
              {isImporting ? 'Importing...' : 'Import CSV'}
            </Button>
          </label>
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={isExporting || contacts.length === 0}
            className="flex items-center gap-2"
          >
            {isExporting ? 'Exporting...' : 'Export CSV'}
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Add New Contact</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateContact} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name *</label>
              <Input
                name="name"
                value={newContact.name}
                onChange={handleInputChange}
                placeholder="John Doe"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email *</label>
              <Input
                name="email"
                type="email"
                value={newContact.email}
                onChange={handleInputChange}
                placeholder="john@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Company</label>
              <Input
                name="company"
                value={newContact.company}
                onChange={handleInputChange}
                placeholder="Acme Inc."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <Input
                name="phone"
                value={newContact.phone}
                onChange={handleInputChange}
                placeholder="+1 234 567 8900"
              />
            </div>
            <div className="md:col-span-2">
              <Button type="submit" className="w-full">Add Contact</Button>
            </div>
          </form>
        </CardContent>
      </Card>
      
      <div className="flex items-center space-x-2 mb-4">
        <Input
          placeholder="Search contacts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={handleSearch}>Search</Button>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 p-4 rounded-md text-red-800">
          <p>{error}</p>
          <button 
            onClick={() => fetchContacts(pagination.offset, searchTerm)} 
            className="mt-2 text-sm text-red-600 hover:text-red-800"
          >
            Try again
          </button>
        </div>
      ) : contacts.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-md">
          <p className="text-gray-500">No contacts found</p>
          {searchTerm && (
            <Button 
              variant="link" 
              onClick={() => {
                setSearchTerm('');
                fetchContacts(0, '');
              }}
            >
              Clear search
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">Company</th>
                  <th className="px-4 py-2 text-left">Phone</th>
                  <th className="px-4 py-2 text-left">Created</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((contact) => (
                  <tr key={contact.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2">{contact.name}</td>
                    <td className="px-4 py-2">{contact.email}</td>
                    <td className="px-4 py-2">{contact.company || '-'}</td>
                    <td className="px-4 py-2">{contact.phone || '-'}</td>
                    <td className="px-4 py-2">
                      {new Date(contact.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <p className="text-sm text-gray-500">
              Showing {pagination.offset + 1} to {Math.min(pagination.offset + contacts.length, pagination.total)} of {pagination.total} contacts
            </p>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={handlePrevPage}
                disabled={pagination.offset === 0}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={handleNextPage}
                disabled={!pagination.hasMore}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}