"use client";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { collection, addDoc, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function WorkflowAutomation() {
  const { user } = useAuth();
  const [workflows, setWorkflows] = useState([]);
  const [newWorkflowName, setNewWorkflowName] = useState("");
  const [workflowType, setWorkflowType] = useState("lead_enrichment");
  const [loading, setLoading] = useState(false);
  const [executing, setExecuting] = useState<string | null>(null);

  useEffect(() => {
    if (user) fetchWorkflows();
  }, [user]);

  const fetchWorkflows = async () => {
    try {
      // Fetch from n8n
      const response = await fetch('/api/n8n/workflows');
      const n8nWorkflows = await response.json();
      
      // Also fetch local workflow records
      const q = query(
        collection(db, `users/${user?.uid}/workflows`),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      const localWorkflows = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Combine and match workflows
      const combinedWorkflows = localWorkflows.map(local => {
        const n8nWorkflow = n8nWorkflows.data?.find((n8n: any) => n8n.name.includes(local.name));
        return {
          ...local,
          n8nId: n8nWorkflow?.id,
          active: n8nWorkflow?.active || false
        };
      });
      
      setWorkflows(combinedWorkflows);
    } catch (error) {
      console.error("Error fetching workflows:", error);
    }
  };

  const createWorkflow = async () => {
    if (!newWorkflowName.trim()) {
      toast.error("Please enter a workflow name");
      return;
    }

    setLoading(true);
    try {
      let n8nWorkflow = null;
      
      // Try to create workflow in n8n
      try {
        const response = await fetch('/api/n8n/workflows', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newWorkflowName, type: workflowType })
        });
        
        if (response.ok) {
          n8nWorkflow = await response.json();
          console.log('n8n workflow created:', n8nWorkflow);
        }
      } catch (n8nError) {
        console.warn('n8n not available, creating local workflow only:', n8nError);
      }
      
      // Save workflow to Firestore (with or without n8n integration)
      const workflowData: any = {
        name: newWorkflowName,
        status: n8nWorkflow ? "Active" : "Local",
        triggers: 0,
        createdAt: new Date().toISOString(),
        type: workflowType
      };
      
      if (n8nWorkflow?.id) {
        workflowData.n8nId = n8nWorkflow.id;
      }
      
      await addDoc(collection(db, `users/${user?.uid}/workflows`), workflowData);
      
      if (n8nWorkflow) {
        toast.success("Workflow created with n8n integration!");
      } else {
        toast.success("Workflow created locally (n8n offline)");
      }
      
      setNewWorkflowName("");
      fetchWorkflows();
    } catch (error: any) {
      console.error("Error creating workflow:", error);
      toast.error("Failed to create workflow");
    } finally {
      setLoading(false);
    }
  };
  
  const executeWorkflow = async (workflow: any) => {
    setExecuting(workflow.id);
    
    if (!workflow.n8nId) {
      // Simulate local execution
      setTimeout(() => {
        toast.success(`Simulated execution of ${workflow.name} (n8n offline)`);
        setExecuting(null);
      }, 2000);
      return;
    }
    
    try {
      const response = await fetch('/api/n8n/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          workflowId: workflow.n8nId,
          data: { source: 'opulflow', userId: user?.uid }
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        toast.success("n8n workflow executed successfully!");
        console.log('Execution result:', result);
      } else {
        throw new Error('n8n execution failed');
      }
    } catch (error) {
      console.error("Error executing workflow:", error);
      toast.warning(`Simulated execution of ${workflow.name} (n8n unavailable)`);
    } finally {
      setExecuting(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2 mb-4">
        <div className="flex gap-2">
          <Input
            placeholder="Enter workflow name..."
            value={newWorkflowName}
            onChange={(e) => setNewWorkflowName(e.target.value)}
          />
          <select 
            value={workflowType} 
            onChange={(e) => setWorkflowType(e.target.value)}
            className="border rounded-md px-3 py-2"
          >
            <option value="lead_enrichment">Lead Enrichment</option>
            <option value="email_sequence">Email Sequence</option>
            <option value="data_sync">Data Sync</option>
          </select>
          <Button onClick={createWorkflow} disabled={loading}>
            {loading ? "Creating..." : "Create Workflow"}
          </Button>
        </div>
      </div>
      
      <div className="grid gap-4">
        {workflows.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No workflows created yet</p>
            <p className="text-sm">Create your first workflow above</p>
          </div>
        ) : (
          workflows.map((workflow) => (
            <Card key={workflow.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <h4 className="font-medium">{workflow.name}</h4>
                    <p className="text-sm text-gray-500">{workflow.triggers || 0} triggers this month</p>
                    <p className="text-xs text-gray-400">Type: {workflow.type?.replace('_', ' ')}</p>
                    <p className="text-xs text-gray-400">n8n ID: {workflow.n8nId || 'Not synced'}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      size="sm" 
                      onClick={() => executeWorkflow(workflow)}
                      disabled={executing === workflow.id || !workflow.n8nId}
                    >
                      {executing === workflow.id ? "Running..." : "Execute"}
                    </Button>
                    <span className={`px-2 py-1 rounded text-xs ${
                      workflow.active ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {workflow.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}