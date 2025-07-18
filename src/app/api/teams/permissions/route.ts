import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore, verifySessionCookie } from '@/lib/admin';

export async function PUT(request: NextRequest) {
  try {
    // Get session cookie
    const sessionCookie = request.cookies.get('session')?.value;
    
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Verify session
    const decodedClaims = await verifySessionCookie(sessionCookie);
    const uid = decodedClaims.uid;
    
    // Get request data
    const { memberId, role } = await request.json();
    
    if (!memberId) {
      return NextResponse.json({ error: 'Member ID is required' }, { status: 400 });
    }
    
    // Validate role
    const validRoles = ['member', 'admin'];
    if (!role || !validRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }
    
    // Get user's team
    const db = getAdminFirestore();
    const userDoc = await db.collection('users').doc(uid).get();
    
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const userData = userDoc.data();
    const teamId = userData?.teamId || uid; // If no team, user's ID is the team ID
    
    // Check if user is team owner or admin
    if (teamId !== uid && userData?.teamRole !== 'admin') {
      return NextResponse.json({ error: 'Only team owners and admins can update permissions' }, { status: 403 });
    }
    
    // Check if member exists and belongs to the team
    const memberDoc = await db.collection('users').doc(memberId).get();
    
    if (!memberDoc.exists) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }
    
    const memberData = memberDoc.data();
    
    if (memberData?.teamId !== teamId) {
      return NextResponse.json({ error: 'Member does not belong to your team' }, { status: 403 });
    }
    
    // Cannot change owner's role
    if (memberId === teamId) {
      return NextResponse.json({ error: 'Cannot change team owner\'s role' }, { status: 400 });
    }
    
    // Update member's role
    await db.collection('users').doc(memberId).update({
      teamRole: role,
      updatedAt: new Date().toISOString(),
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update team permissions error:', error);
    return NextResponse.json(
      { error: 'Failed to update team permissions' },
      { status: 500 }
    );
  }
}