import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const email = url.searchParams.get('email');
  
  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  return NextResponse.json({
    email,
    name: '',
    phone: ''
  });
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { email, name, phone } = body;
  
  if (!email || !name || !phone) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  
  return NextResponse.json({ 
    success: true, 
    data: { email, name: name.trim(), phone: phone.trim() }
  });
}