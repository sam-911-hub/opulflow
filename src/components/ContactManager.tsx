'use client';
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { toast } from 'sonner';
import { Badge } from './ui/badge';

type Contact = {
  id: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  title?: string;
  industry?: string;
  location?: string;
  linkedinUrl?: string;
  domain?: string;
  companySize?: number;
  technologies?: string[];
  source?: string;
  enrichedAt?: string;
  verificationStatus?: {
    result: string;
    score: number;
    disposable: boolean;
    webmail: boolean;
  };
  createdAt: string;
};

type PaginationInfo = {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
};

type LeadSearchForm = {
  email: string;
  name: string;
  company: string;
  domain: string;
  linkedinUrl?: string;
};

type EmailFinderForm = {
  domain: string;
  firstName: string;
  lastName: string;
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

  // Form states for API services
  const [leadSearchForm, setLeadSearchForm] = useState<LeadSearchForm>({
    email: '',
    name: '',
    company: '',
    domain: '',
    linkedinUrl: ''
  });

  const [emailFinderForm, setEmailFinderForm] = useState<EmailFinderForm>({
    domain: '',
    firstName: '',
    lastName: ''
  });

  const [emailsToVerify, setEmailsToVerify] = useState('');
  const [isSearchingLeads, setIsSearchingLeads] = useState(false);
  const [isFindingEmails, setIsFindingEmails] = useState(false);
  const [isVerifyingEmails, setIsVerifyingEmails] = useState(false);
  const [activeTab, setActiveTab] = useState('contacts');
  
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

  // Apollo.io Lead Lookup
  const handleLeadSearch = async () => {
    if (!leadSearchForm.email && !leadSearchForm.name && !leadSearchForm.company && !leadSearchForm.domain && !leadSearchForm.linkedinUrl) {
      toast.error('Please fill at least one search field');
      return;
    }

    setIsSearchingLeads(true);
    try {
      const response = await fetch('/api/apify/lead-lookup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(leadSearchForm),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to search leads');
      }

      if (data.leads && data.leads.length > 0) {
        // Add found leads to contacts
        const newContacts = data.leads.map((lead: any) => ({
          id: `apollo-${lead.id}`,
          name: lead.name,
          email: lead.email,
          company: lead.company,
          phone: lead.phone,
          title: lead.title,
          industry: lead.industry,
          location: lead.location,
          linkedinUrl: lead.linkedinUrl,
          domain: lead.domain,
          companySize: lead.companySize,
          technologies: lead.technologies,
          source: lead.source,
          enrichedAt: lead.enrichedAt,
          createdAt: new Date().toISOString()
        }));

        setContacts(prev => [...newContacts, ...prev]);
        toast.success(`Found ${data.leads.length} leads! Credits used: ${data.creditsUsed}`);
        
        // Reset form
        setLeadSearchForm({ email: '', name: '', company: '', domain: '', linkedinUrl: '' });
      } else {
        toast.info('No leads found with the given criteria');
      }
    } catch (error: any) {
      console.error('Lead search error:', error);
      toast.error(error.message || 'Failed to search leads');
    } finally {
      setIsSearchingLeads(false);
    }
  };

  // Hunter.io Email Finder
  const handleEmailFinder = async () => {
    if (!emailFinderForm.domain || (!emailFinderForm.firstName && !emailFinderForm.lastName)) {
      toast.error('Please provide domain and at least first or last name');
      return;
    }

    setIsFindingEmails(true);
    try {
      const response = await fetch('/api/hunter/email-finder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailFinderForm),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to find email');
      }

      if (data.result && data.result.email) {
        const result = data.result;
        const newContact = {
          id: `hunter-${Date.now()}`,
          name: `${result.firstName || ''} ${result.lastName || ''}`.trim(),
          email: result.email,
          company: result.company,
          title: result.position,
          domain: emailFinderForm.domain,
          verificationStatus: result.verificationStatus,
          source: result.provider,
          createdAt: new Date().toISOString()
        };

        setContacts(prev => [newContact, ...prev]);
        toast.success(`Email found: ${result.email} (Confidence: ${result.confidence}%)`);
        
        // Reset form
        setEmailFinderForm({ domain: '', firstName: '', lastName: '' });
      } else {
        toast.info('No email found for the given criteria');
      }
    } catch (error: any) {
      console.error('Email finder error:', error);
      toast.error(error.message || 'Failed to find email');
    } finally {
      setIsFindingEmails(false);
    }
  };

  // Hunter.io Email Verification
  const handleEmailVerification = async () => {
    if (!emailsToVerify.trim()) {
      toast.error('Please enter at least one email address');
      return;
    }

    const emails = emailsToVerify
      .split('\n')
      .map(email => email.trim())
      .filter(email => email.length > 0);

    if (emails.length === 0) {
      toast.error('Please enter valid email addresses');
      return;
    }

    setIsVerifyingEmails(true);
    try {
      const response = await fetch('/api/hunter/email-verifier', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emails }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify emails');
      }

      if (data.results && data.results.length > 0) {
        toast.success(
          `Verified ${data.results.length} emails. ` +
          `Deliverable: ${data.summary.deliverable}, ` +
          `Undeliverable: ${data.summary.undeliverable}, ` +
          `Risky: ${data.summary.risky}`
        );
        
        // Update existing contacts with verification status
        setContacts(prev => prev.map(contact => {
          const verification = data.results.find((r: any) => r.email === contact.email);
          if (verification) {
            return {
              ...contact,
              verificationStatus: {
                result: verification.result,
                score: verification.score,
                disposable: verification.disposable,
                webmail: verification.webmail
              }
            };
          }
          return contact;
        }));
        
        // Reset form
        setEmailsToVerify('');
      } else {
        toast.info('No verification results received');
      }
    } catch (error: any) {
      console.error('Email verification error:', error);
      toast.error(error.message || 'Failed to verify emails');
    } finally {
      setIsVerifyingEmails(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Lead Intelligence & Contact Management</h2>
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

      {/* Service Tabs */}
      <div className="bg-white rounded-lg border">
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'contacts', name: 'Contacts', icon: '👥' },
              { id: 'lead-search', name: 'Lead Intelligence', icon: '🔍' },
              { id: 'email-finder', name: 'Email Finder', icon: '📧' },
              { id: 'email-verify', name: 'Email Verification', icon: '✅' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Lead Intelligence Tab */}
          {activeTab === 'lead-search' && (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-800 mb-2">🔍 Lead Intelligence & Enrichment</h3>
                <p className="text-blue-700 text-sm mb-2">Extract comprehensive LinkedIn profile data including contact information and work history.</p>
                <p className="text-blue-700 text-sm">
                  <strong>Best Results:</strong> Provide a LinkedIn profile URL for detailed enrichment. Cost: $0.25 per search
                </p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    LinkedIn Profile URL <span className="text-blue-600">(Recommended)</span>
                  </label>
                  <Input
                    value={leadSearchForm.linkedinUrl || ''}
                    onChange={(e) => setLeadSearchForm(prev => ({ ...prev, linkedinUrl: e.target.value }))}
                    placeholder="https://www.linkedin.com/in/john-doe"
                  />
                  <p className="text-xs text-gray-500 mt-1">LinkedIn URL provides the most comprehensive data</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <Input
                      value={leadSearchForm.email}
                      onChange={(e) => setLeadSearchForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Name</label>
                    <Input
                      value={leadSearchForm.name}
                      onChange={(e) => setLeadSearchForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Company</label>
                    <Input
                      value={leadSearchForm.company}
                      onChange={(e) => setLeadSearchForm(prev => ({ ...prev, company: e.target.value }))}
                      placeholder="Example Corp"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Domain</label>
                    <Input
                      value={leadSearchForm.domain}
                      onChange={(e) => setLeadSearchForm(prev => ({ ...prev, domain: e.target.value }))}
                      placeholder="example.com"
                    />
                  </div>
                </div>
              </div>
              
              <Button
                onClick={handleLeadSearch}
                disabled={isSearchingLeads}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSearchingLeads ? 'Searching...' : 'Search Leads (1 Credit)'}
              </Button>
            </div>
          )}

          {/* Email Finder Tab */}
          {activeTab === 'email-finder' && (
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h3 className="font-semibold text-green-800 mb-2">Professional Email Finder</h3>
                <p className="text-green-700 text-sm">Find email addresses for contacts at specific companies. Cost: $0.05 per search</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Domain *</label>
                  <Input
                    value={emailFinderForm.domain}
                    onChange={(e) => setEmailFinderForm(prev => ({ ...prev, domain: e.target.value }))}
                    placeholder="example.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">First Name</label>
                  <Input
                    value={emailFinderForm.firstName}
                    onChange={(e) => setEmailFinderForm(prev => ({ ...prev, firstName: e.target.value }))}
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Last Name</label>
                  <Input
                    value={emailFinderForm.lastName}
                    onChange={(e) => setEmailFinderForm(prev => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Doe"
                  />
                </div>
              </div>
              
              <Button
                onClick={handleEmailFinder}
                disabled={isFindingEmails}
                className="bg-green-600 hover:bg-green-700"
              >
                {isFindingEmails ? 'Finding...' : 'Find Email (1 Credit)'}
              </Button>
            </div>
          )}

          {/* Email Verification Tab */}
          {activeTab === 'email-verify' && (
            <div className="space-y-4">
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h3 className="font-semibold text-purple-800 mb-2">Email Verification & Validation</h3>
                <p className="text-purple-700 text-sm">Verify email addresses for deliverability. Cost: $0.05 per email. Max 50 emails at once.</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Email Addresses (one per line)</label>
                <textarea
                  value={emailsToVerify}
                  onChange={(e) => setEmailsToVerify(e.target.value)}
                  placeholder="john@example.com&#10;jane@example.com&#10;..."
                  rows={6}
                  className="w-full p-3 border rounded-md resize-vertical"
                />
                <p className="text-sm text-gray-500 mt-1">
                  {emailsToVerify.split('\n').filter(e => e.trim()).length} emails to verify
                </p>
              </div>
              
              <Button
                onClick={handleEmailVerification}
                disabled={isVerifyingEmails}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isVerifyingEmails ? 'Verifying...' : `Verify Emails (${emailsToVerify.split('\n').filter(e => e.trim()).length} Credits)`}
              </Button>
            </div>
          )}

          {/* Contacts Tab */}
          {activeTab === 'contacts' && (
            <div className="space-y-6">
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
                  <th className="px-4 py-2 text-left">Title</th>
                  <th className="px-4 py-2 text-left">Source</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Created</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((contact) => (
                  <tr key={contact.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2">
                      <div>
                        <div className="font-medium">{contact.name}</div>
                        {contact.location && (
                          <div className="text-sm text-gray-500">{contact.location}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <div>
                        <div>{contact.email}</div>
                        {contact.verificationStatus && (
                          <Badge 
                            variant={contact.verificationStatus.result === 'deliverable' ? 'default' : 
                                   contact.verificationStatus.result === 'risky' ? 'secondary' : 'destructive'}
                            className="text-xs mt-1"
                          >
                            {contact.verificationStatus.result} ({contact.verificationStatus.score}%)
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <div>
                        <div>{contact.company || '-'}</div>
                        {contact.industry && (
                          <div className="text-sm text-gray-500">{contact.industry}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2">{contact.title || '-'}</td>
                    <td className="px-4 py-2">
                      {contact.source && (
                        <Badge variant="outline" className="text-xs">
                          {contact.source}
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex flex-col gap-1">
                        {contact.technologies && contact.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {contact.technologies.slice(0, 2).map((tech, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {tech}
                              </Badge>
                            ))}
                            {contact.technologies.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{contact.technologies.length - 2}
                              </Badge>
                            )}
                          </div>
                        )}
                        {contact.linkedinUrl && (
                          <a 
                            href={contact.linkedinUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-xs"
                          >
                            LinkedIn
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <div className="text-sm">
                        {new Date(contact.createdAt).toLocaleDateString()}
                      </div>
                      {contact.enrichedAt && (
                        <div className="text-xs text-gray-500">
                          Enriched: {new Date(contact.enrichedAt).toLocaleDateString()}
                        </div>
                      )}
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
          )}
        </div>
      </div>
    </div>
  );
}