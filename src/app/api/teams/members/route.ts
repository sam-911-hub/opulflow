import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore, verifySessionCookie } from '@/lib/admin';

export async function GET(request: NextRequest) {
  try {
    // Get session cookie
    const sessionCookie = request.cookies.get('session')?.value;
    
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Verify session
    const decodedClaims = await verifySessionCookie(sessionCookie);
    const uid = decodedClaims.uid;
    
    // Get user's team
    const db = getAdminFirestore();
    const userDoc = await db.collection('users').doc(uid).get();
    
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const userData = userDoc.data();
    const teamId = userData?.teamId || uid; // If no team, user's ID is the team ID
    
    // Get team members
    const membersSnapshot = await db.collection('users')
      .where('teamId', '==', teamId)
      .get();
    
    const members = membersSnapshot.docs.map(doc => {
      const memberData = doc.data();
      return {
        id: doc.id,
        email: memberData.email,
        displayName: memberData.displayName,
        role: memberData.teamRole || 'member',
        joinedAt: memberData.teamJoinedAt,
      };
    });
    
    // Add team owner if not in members list
    if (!members.some(member => member.id === teamId)) {
      const ownerDoc = await db.collection('users').doc(teamId).get();
      if (ownerDoc.exists) {
        const ownerData = ownerDoc.data();
        members.unshift({
          id: teamId,
          email: ownerData?.email,
          displayName: ownerData?.displayName,
          role: 'owner',
          joinedAt: ownerData?.createdAt,
        });
      }
    }
    
    // Get pending invitations
    const invitationsSnapshot = await db.collection('teamInvitations')
      .where('teamId', '==', teamId)
      .where('status', '==', 'pending')
      .get();
    
    const pendingInvitations = invitationsSnapshot.docs.map(doc => {
      const inviteData = doc.data();
      return {
        id: doc.id,
        email: inviteData.email,
        role: inviteData.role,
        invitedBy: inviteData.invitedBy,
        createdAt: inviteData.createdAt,
        expiresAt: inviteData.expiresAt,
      };
    });
    
    return NextResponse.json({
      members,
      pendingInvitations,
      teamId,
      userRole: userData?.teamRole || (uid === teamId ? 'owner' : 'member'),
    });
  } catch (error) {
    console.error('Get team members error:', error);
    return NextResponse.json(
      { error: 'Failed to get team members' },
      { status: 500 }
    );
  }
}