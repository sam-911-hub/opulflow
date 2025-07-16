import { NextRequest, NextResponse } from 'next/server';
import { n8nService } from '@/lib/n8n';

export async function POST(request: NextRequest) {
  try {
    const { workflowId, data } = await request.json();
    
    const execution = await n8nService.executeWorkflow(workflowId, data);
    return NextResponse.json(execution);
  } catch (error) {
    console.error('Error executing n8n workflow:', error);
    return NextResponse.json({ error: 'Failed to execute workflow' }, { status: 500 });
  }
}