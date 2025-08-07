const N8N_URL = process.env.N8N_URL || 'http://localhost:5678';
const N8N_API_KEY = process.env.N8N_API_KEY;

class N8nService {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = N8N_URL;
    this.apiKey = N8N_API_KEY!;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}/api/v1${endpoint}`;
    
    console.log('Making n8n request to:', url);
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'X-N8N-API-KEY': this.apiKey,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('n8n API error response:', errorText);
      throw new Error(`n8n API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response.json();
  }

  // Get all workflows
  async getWorkflows() {
    return this.makeRequest('/workflows');
  }

  // Create a new workflow
  async createWorkflow(workflowData: any) {
    console.log('Creating workflow with data:', workflowData);
    return this.makeRequest('/workflows', {
      method: 'POST',
      body: JSON.stringify(workflowData),
    });
  }

  // Execute a workflow
  async executeWorkflow(workflowId: string, data: any = {}) {
    return this.makeRequest(`/workflows/${workflowId}/execute`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Get workflow executions
  async getExecutions(workflowId?: string) {
    const endpoint = workflowId ? `/executions?workflowId=${workflowId}` : '/executions';
    return this.makeRequest(endpoint);
  }

  // Activate/Deactivate workflow
  async toggleWorkflow(workflowId: string, active: boolean) {
    return this.makeRequest(`/workflows/${workflowId}`, {
      method: 'PATCH',
      body: JSON.stringify({ active }),
    });
  }

  // Create predefined workflows
  async createLeadEnrichmentWorkflow(name: string) {
    const workflow = {
      name: `${name} - Lead Enrichment`,
      nodes: [
        {
          parameters: {},
          id: "start",
          name: "Start",
          type: "n8n-nodes-base.start",
          typeVersion: 1,
          position: [240, 300]
        },
        {
          parameters: {
            functionCode: "// Lead enrichment logic\nconst leadData = items[0].json;\nconsole.log('Processing lead:', leadData);\nreturn items;"
          },
          id: "function",
          name: "Process Lead",
          type: "n8n-nodes-base.function",
          typeVersion: 1,
          position: [460, 300]
        }
      ],
      connections: {
        "Start": {
          main: [
            [
              {
                node: "Process Lead",
                type: "main",
                index: 0
              }
            ]
          ]
        }
      },
      settings: {},
      staticData: {}
    };

    return this.createWorkflow(workflow);
  }

  async createEmailSequenceWorkflow(name: string) {
    const workflow = {
      name: `${name} - Email Sequence`,
      nodes: [
        {
          parameters: {},
          id: "webhook-trigger",
          name: "Email Trigger",
          type: "n8n-nodes-base.webhook",
          typeVersion: 1,
          position: [250, 300],
          webhookId: "email-sequence"
        },
        {
          parameters: {
            operation: "send",
            email: "={{ $json.email }}",
            subject: "Welcome to OpulFlow",
            message: "Thank you for joining!"
          },
          id: "email-sender",
          name: "Send Email",
          type: "n8n-nodes-base.emailSend",
          typeVersion: 1,
          position: [450, 300]
        }
      ],
      connections: {
        "Email Trigger": {
          main: [
            [
              {
                node: "Send Email",
                type: "main",
                index: 0
              }
            ]
          ]
        }
      },
      settings: {},
      staticData: {}
    };

    return this.createWorkflow(workflow);
  }

  async createDataSyncWorkflow(name: string) {
    const workflow = {
      name: `${name} - Data Sync`,
      nodes: [
        {
          parameters: {
            rule: {
              interval: [
                {
                  field: "cronExpression",
                  expression: "0 */6 * * *"
                }
              ]
            }
          },
          id: "cron-trigger",
          name: "Every 6 Hours",
          type: "n8n-nodes-base.cron",
          typeVersion: 1,
          position: [250, 300]
        },
        {
          parameters: {
            functionCode: "// Sync data logic\nreturn items;"
          },
          id: "data-syncer",
          name: "Sync Data",
          type: "n8n-nodes-base.function",
          typeVersion: 1,
          position: [450, 300]
        }
      ],
      connections: {
        "Every 6 Hours": {
          main: [
            [
              {
                node: "Sync Data",
                type: "main",
                index: 0
              }
            ]
          ]
        }
      },
      settings: {},
      staticData: {}
    };

    return this.createWorkflow(workflow);
  }
}

export const n8nService = new N8nService();