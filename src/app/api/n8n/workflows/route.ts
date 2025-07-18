import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/apiMiddleware';
import { n8nService } from '@/lib/n8n';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  return withAuth(request, async (req, userId) => {
    try {
      // Try to get workflows from n8n
      try {
        const workflows = await n8nService.getWorkflows();
        
        return NextResponse.json({
          success: true,
          data: workflows
        });
      } catch (n8nError) {
        console.warn('n8n get workflows error:', n8nError);
        
        // If n8n is not available, return mock data
        return NextResponse.json({
          success: true,
          simulated: true,
          data: [
            {
              id: 'mock-workflow-1',
              name: 'Lead Enrichment',
              active: true,
              createdAt: new Date().toISOString()
            },
            {
              id: 'mock-workflow-2',
              name: 'Email Sequence',
              active: false,
              createdAt: new Date().toISOString()
            },
            {
              id: 'mock-workflow-3',
              name: 'Data Sync',
              active: true,
              createdAt: new Date().toISOString()
            }
          ]
        });
      }
    } catch (error) {
      console.error('Get workflows error:', error);
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to get workflows' 
      }, { status: 500 });
    }
  });
}

export async function POST(request: NextRequest) {
  return withAuth(request, async (req, userId) => {
    try {
      // Get request data
      const { name, type } = await req.json();
      
      if (!name || !type) {
        return NextResponse.json({ 
          success: false, 
          message: 'Name and type are required' 
        }, { status: 400 });
      }
      
      // Try to create workflow in n8n
      try {
        let workflow;
        
        // Create different workflow types
        switch (type) {
          case 'lead_enrichment':
            workflow = await n8nService.createLeadEnrichmentWorkflow(name);
            break;
          case 'email_sequence':
            workflow = await n8nService.createEmailSequenceWorkflow(name);
            break;
          case 'data_sync':
            workflow = await n8nService.createDataSyncWorkflow(name);
            break;
          default:
            // Default to lead enrichment
            workflow = await n8nService.createLeadEnrichmentWorkflow(name);
        }
        
        return NextResponse.json({
          success: true,
          data: workflow
        });
      } catch (n8nError) {
        console.warn('n8n create workflow error:', n8nError);
        
        // If n8n is not available, return mock data
        return NextResponse.json({
          success: true,
          simulated: true,
          data: {
            id: `mock-workflow-${Date.now()}`,
            name: `${name} - ${type.replace('_', ' ')}`,
            active: false,
            createdAt: new Date().toISOString()
          }
        });
      }
    } catch (error) {
      console.error('Create workflow error:', error);
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to create workflow' 
      }, { status: 500 });
    }
  });
}