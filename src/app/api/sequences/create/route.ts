import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore, verifySessionCookie } from '@/lib/admin';

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
    const { name, steps } = await request.json();
    
    if (!name) {
      return NextResponse.json({ error: 'Sequence name is required' }, { status: 400 });
    }
    
    if (!steps || !Array.isArray(steps) || steps.length === 0) {
      return NextResponse.json({ error: 'At least one sequence step is required' }, { status: 400 });
    }
    
    // Validate steps
    const validSteps = steps.map((step, index) => {
      if (!step.subject || !step.content) {
        throw new Error(`Step ${index + 1} is missing subject or content`);
      }
      
      return {
        order: index + 1,
        subject: step.subject,
        content: step.content,
        delayDays: step.delayDays || (index === 0 ? 0 : 1),
      };
    });
    
    // Create sequence in Firestore
    const db = getAdminFirestore();
    const sequenceRef = db.collection('sequences').doc();
    
    await sequenceRef.set({
      userId: uid,
      name,
      steps: validSteps,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    
    return NextResponse.json({
      id: sequenceRef.id,
      name,
      steps: validSteps,
      active: true,
      createdAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Create sequence error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create sequence' },
      { status: 400 }
    );
  }
}