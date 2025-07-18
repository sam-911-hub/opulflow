// Mock data for testing API endpoints

export const mockDashboardStats = {
  currentCredits: 250,
  creditUsage: 75,
  creditPurchases: 300,
  contactsCount: 42,
  recentActivities: [
    {
      id: 'act1',
      type: 'lead_lookup',
      description: 'Looked up contact information',
      timestamp: new Date().toISOString(),
    },
    {
      id: 'act2',
      type: 'email_verification',
      description: 'Verified email address',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'act3',
      type: 'credit_purchase',
      description: 'Purchased 100 credits',
      timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    },
  ],
  period: '30d',
};

export const mockContacts = [
  {
    id: 'contact1',
    name: 'John Doe',
    email: 'john@example.com',
    company: 'Acme Inc',
    phone: '+1234567890',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'contact2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    company: 'Tech Corp',
    phone: '+0987654321',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'contact3',
    name: 'Bob Johnson',
    email: 'bob@example.com',
    company: 'Dev LLC',
    phone: '+1122334455',
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
  },
];

export const mockTransactions = [
  {
    id: 'tx1',
    type: 'purchase',
    credits: 100,
    amount: 10,
    paymentMethod: 'paypal',
    timestamp: new Date().toISOString(),
    orderId: 'order123',
  },
  {
    id: 'tx2',
    type: 'usage',
    credits: 1,
    service: 'lead_lookup',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'tx3',
    type: 'usage',
    credits: 1,
    service: 'email_verification',
    timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
  },
];

export const mockApiKeys = [
  {
    id: 'key1',
    name: 'Production API Key',
    keyPreview: 'opul_a1b2...c3d4',
    createdAt: new Date().toISOString(),
    lastUsed: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    active: true,
  },
  {
    id: 'key2',
    name: 'Development API Key',
    keyPreview: 'opul_e5f6...g7h8',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    lastUsed: null,
    active: true,
  },
];