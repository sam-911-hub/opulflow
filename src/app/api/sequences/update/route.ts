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
    const { id, name, steps, active } = await request.json();
    
    if (!id) {
      return NextResponse.json({ error: 'Sequence ID is required' }, { status: 400 });
    }
    
    // Get sequence from Firestore
    const db = getAdminFirestore();
    const sequenceRef = db.collection('sequences').doc(id);
    const sequenceDoc = await sequenceRef.get();
    
    if (!sequenceDoc.exists) {
      return NextResponse.json({ error: 'Sequence not found' }, { status: 404 });
    }
    
    // Check if user owns the sequence
    const sequenceData = sequenceDoc.data();
    if (sequenceData?.userId !== uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    // Prepare update data
    const updateData: any = {
      updatedAt: new Date().toISOString(),
    };
    
    if (name !== undefined) {
      updateData.name = name;
    }
    
    if (active !== undefined) {
      updateData.active = active;
    }
    
    if (steps !== undefined) {
      if (!Array.isArray(steps) || steps.length === 0) {
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
      
      updateData.steps = validSteps;
    }
    
    // Update sequence
    await sequenceRef.update(updateData);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Update sequence error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update sequence' },
      { status: 400 }
    );
  }
}