import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminFirestore, verifySessionCookie } from '@/lib/admin';

export async function POST(request: NextRequest) {
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
    const { email, role } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    
    // Validate role
    const validRoles = ['member', 'admin'];
    const memberRole = role && validRoles.includes(role) ? role : 'member';
    
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
      return NextResponse.json({ error: 'Only team owners and admins can invite members' }, { status: 403 });
    }
    
    // Check if invited user already exists
    let invitedUid = null;
    try {
      const userRecord = await getAdminAuth().getUserByEmail(email);
      invitedUid = userRecord.uid;
      
      // Check if user is already in a team
      const invitedUserDoc = await db.collection('users').doc(invitedUid).get();
      if (invitedUserDoc.exists && invitedUserDoc.data()?.teamId) {
        return NextResponse.json({ error: 'User is already in a team' }, { status: 400 });
      }
    } catch (error) {
      // User doesn't exist, will be created when they register
    }
    
    // Create or update team invitation
    const invitationRef = db.collection('teamInvitations').doc();
    await invitationRef.set({
      teamId,
      invitedBy: uid,
      email,
      role: memberRole,
      status: 'pending',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    });
    
    // TODO: Send invitation email
    
    return NextResponse.json({
      success: true,
      invitationId: invitationRef.id,
    });
  } catch (error) {
    console.error('Team invite error:', error);
    return NextResponse.json(
      { error: 'Failed to send team invitation' },
      { status: 500 }
    );
  }
}