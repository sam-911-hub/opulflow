import { NextRequest, NextResponse } from 'next/server';
import { n8nService } from '@/lib/n8n';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const workflows = await n8nService.getWorkflows();
    return NextResponse.json(workflows);
  } catch (error) {
    console.error('Error fetching n8n workflows:', error);
    return NextResponse.json({ error: 'Failed to fetch workflows' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('API route called for workflow creation');
    const { name, type } = await request.json();
    console.log('Request data:', { name, type });
    
    let workflow;
    switch (type) {
      case 'lead_enrichment':
        console.log('Creating lead enrichment workflow');
        workflow = await n8nService.createLeadEnrichmentWorkflow(name);
        break;
      case 'email_sequence':
        console.log('Creating email sequence workflow');
        workflow = await n8nService.createEmailSequenceWorkflow(name);
        break;
      case 'data_sync':
        console.log('Creating data sync workflow');
        workflow = await n8nService.createDataSyncWorkflow(name);
        break;
      default:
        return NextResponse.json({ error: 'Invalid workflow type' }, { status: 400 });
    }
    
    console.log('Workflow created successfully:', workflow);
    return NextResponse.json(workflow);
  } catch (error: any) {
    console.error('Error creating n8n workflow:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    return NextResponse.json({ 
      error: 'Failed to create workflow',
      details: error.message 
    }, { status: 500 });
  }
}