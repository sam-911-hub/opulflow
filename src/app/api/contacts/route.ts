import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Simple in-memory storage
const contacts = new Map();

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const search = url.searchParams.get('search') || '';
    
    let allContacts = Array.from(contacts.values());
    
    // Magic search - searches across all fields
    if (search) {
      const searchLower = search.toLowerCase();
      allContacts = allContacts.filter(contact => {
        return (
          contact.name?.toLowerCase().includes(searchLower) ||
          contact.email?.toLowerCase().includes(searchLower) ||
          contact.company?.toLowerCase().includes(searchLower) ||
          contact.title?.toLowerCase().includes(searchLower) ||
          contact.phone?.toLowerCase().includes(searchLower) ||
          contact.location?.toLowerCase().includes(searchLower) ||
          contact.industry?.toLowerCase().includes(searchLower) ||
          contact.notes?.toLowerCase().includes(searchLower)
        );
      });
    }
    
    // Sort by most recent first
    allContacts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    const paginatedContacts = allContacts.slice(offset, offset + limit);
    
    return NextResponse.json({
      contacts: paginatedContacts,
      pagination: { 
        total: allContacts.length, 
        limit, 
        offset, 
        hasMore: offset + limit < allContacts.length 
      },
      searchTerm: search
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    return NextResponse.json({
      contacts: [],
      pagination: { total: 0, limit: 50, offset: 0, hasMore: false }
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const contactData = await request.json();
    
    if (!contactData.name || !contactData.email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }
    
    const id = Date.now().toString();
    const contact = {
      id,
      ...contactData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    contacts.set(id, contact);
    
    return NextResponse.json({ success: true, id, contact });
  } catch (error) {
    console.error('Create contact error:', error);
    return NextResponse.json({ error: 'Failed to create contact' }, { status: 500 });
  }
}