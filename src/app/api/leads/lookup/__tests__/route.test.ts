import { NextRequest } from 'next/server';
import { POST } from '../route';
import { getAdminAuth } from '@/lib/admin';
import { doc, getDoc, updateDoc, collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Mock dependencies
jest.mock('@/lib/admin', () => ({
  getAdminAuth: jest.fn()
}));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn(),
  updateDoc: jest.fn(),
  collection: jest.fn(),
  addDoc: jest.fn()
}));

jest.mock('@/lib/firebase', () => ({
  db: {
    collection: jest.fn()
  }
}));

describe('Lead Lookup API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 if no session cookie', async () => {
    const request = new NextRequest('http://localhost:3000/api/leads/lookup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: 'test@example.com' })
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should return 400 if no search parameters', async () => {
    // Mock session cookie
    const request = new NextRequest('http://localhost:3000/api/leads/lookup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'session=valid-session-cookie'
      },
      body: JSON.stringify({})
    });
    
    // Mock getAdminAuth
    const mockVerifySessionCookie = jest.fn().mockResolvedValue({ uid: 'user123' });
    (getAdminAuth as jest.Mock).mockReturnValue({
      verifySessionCookie: mockVerifySessionCookie
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(400);
    expect(data.error).toBe('At least one search parameter is required');
  });

  it('should return 403 if insufficient credits', async () => {
    // Mock session cookie
    const request = new NextRequest('http://localhost:3000/api/leads/lookup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'session=valid-session-cookie'
      },
      body: JSON.stringify({ email: 'test@example.com' })
    });
    
    // Mock getAdminAuth
    const mockVerifySessionCookie = jest.fn().mockResolvedValue({ uid: 'user123' });
    (getAdminAuth as jest.Mock).mockReturnValue({
      verifySessionCookie: mockVerifySessionCookie
    });
    
    // Mock getDoc
    const mockDocSnap = {
      data: jest.fn().mockReturnValue({
        credits: {
          lead_lookup: 0
        }
      })
    };
    (getDoc as jest.Mock).mockResolvedValue(mockDocSnap);
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(403);
    expect(data.error).toBe('Insufficient lead lookup credits');
  });

  it('should return lead data and deduct credits if successful', async () => {
    // Mock session cookie
    const request = new NextRequest('http://localhost:3000/api/leads/lookup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'session=valid-session-cookie'
      },
      body: JSON.stringify({ email: 'test@example.com' })
    });
    
    // Mock getAdminAuth
    const mockVerifySessionCookie = jest.fn().mockResolvedValue({ uid: 'user123' });
    (getAdminAuth as jest.Mock).mockReturnValue({
      verifySessionCookie: mockVerifySessionCookie
    });
    
    // Mock getDoc
    const mockDocSnap = {
      data: jest.fn().mockReturnValue({
        credits: {
          lead_lookup: 5
        }
      })
    };
    (getDoc as jest.Mock).mockResolvedValue(mockDocSnap);
    
    // Mock collection
    const mockCollection = jest.fn().mockReturnValue('transactions-collection');
    (collection as jest.Mock).mockReturnValue(mockCollection);
    
    // Mock addDoc
    (addDoc as jest.Mock).mockResolvedValue({ id: 'transaction123' });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.email).toBe('test@example.com');
    expect(updateDoc).toHaveBeenCalledWith(expect.anything(), {
      'credits.lead_lookup': 4
    });
    expect(addDoc).toHaveBeenCalled();
  });
});