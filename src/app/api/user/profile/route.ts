import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Simple in-memory storage (will reset on deployment)
const profiles = new Map();

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const email = url.searchParams.get('email');
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const profile = profiles.get(email) || { name: '', phone: '' };
    
    return NextResponse.json({
      email,
      name: profile.name || '',
      phone: profile.phone || ''
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json({ error: 'Failed to get profile' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, phone } = body;
    
    if (!email || !name || !phone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const profileData = { 
      name: name.trim(), 
      phone: phone.trim(), 
      lastUpdated: new Date().toISOString() 
    };
    
    profiles.set(email, profileData);
    
    return NextResponse.json({ success: true, data: { email, ...profileData } });
  } catch (error) {
    console.error('Profile save error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}