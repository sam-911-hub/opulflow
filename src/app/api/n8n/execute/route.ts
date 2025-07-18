import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/apiMiddleware-edge';
import { n8nService } from '@/lib/n8n';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  return withAuth(request, async (req, userId) => {
    try {
      // Get request data
      const { workflowId, data } = await req.json();
      
      if (!workflowId) {
        return NextResponse.json({ 
          success: false, 
          message: 'Workflow ID is required' 
        }, { status: 400 });
      }
      
      // Add user ID to data
      const executionData = {
        ...(data || {}),
        userId,
        timestamp: new Date().toISOString()
      };
      
      // Execute workflow
      let result;
      try {
        // Try to execute the workflow with n8n
        result = await n8nService.executeWorkflow(workflowId, executionData);
      } catch (n8nError) {
        console.warn('n8n execution error:', n8nError);
        
        // If n8n is not available, simulate execution
        result = {
          success: true,
          simulated: true,
          data: {
            message: 'Workflow execution simulated (n8n not available)',
            input: executionData
          }
        };
      }
      
      // Record execution in Firestore
      await addDoc(collection(db, `users/${userId}/workflowExecutions`), {
        workflowId,
        executionData,
        result,
        createdAt: new Date().toISOString()
      });
      
      // Return result
      return NextResponse.json({
        success: true,
        result
      });
      
    } catch (error) {
      console.error('Workflow execution error:', error);
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to execute workflow' 
      }, { status: 500 });
    }
  });
}