"use client";
import { useState, useEffect } from "react";
import { collection, getDocs, addDoc, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import useCredits from "@/hooks/useCredits";

export default function PipelineManagement() {
  const { user } = useAuth();
  const { deductCredits } = useCredits();
  const [pipelines, setPipelines] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [newPipeline, setNewPipeline] = useState({ name: "", stages: ["Lead", "Qualified", "Proposal", "Negotiation", "Closed"] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchPipelines();
      fetchLeads();
    }
  }, [user]);

  const fetchPipelines = async () => {
    try {
      const querySnapshot = await getDocs(
        collection(db, `users/${user?.uid}/pipelines`)
      );
      setPipelines(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error fetching pipelines:", error);
      toast.error("Failed to fetch pipelines");
    }
  };

  const fetchLeads = async () => {
    try {
      const querySnapshot = await getDocs(
        collection(db, `users/${user?.uid}/leads`)
      );
      setLeads(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error fetching leads:", error);
    }
  };

  const createPipeline = async () => {
    if (!newPipeline.name) {
      toast.error("Please enter a pipeline name");
      return;
    }

    // Check if we have credits
    const success = await deductCredits('pipeline', 1);
    if (!success) {
      toast.error("Insufficient pipeline credits");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, `users/${user?.uid}/pipelines`), {
        name: newPipeline.name,
        stages: newPipeline.stages,
        createdAt: new Date().toISOString(),
        deals: []
      });
      toast.success("Pipeline created successfully");
      setNewPipeline({ name: "", stages: ["Lead", "Qualified", "Proposal", "Negotiation", "Closed"] });
      fetchPipelines();
    } catch (error) {
      toast.error("Failed to create pipeline");
    } finally {
      setLoading(false);
    }
  };

  const addDealToPipeline = async (pipelineId: string, leadId: string) => {
    try {
      // Get the lead and pipeline
      const lead = leads.find(l => l.id === leadId);
      const pipeline = pipelines.find(p => p.id === pipelineId);
      
      if (!lead || !pipeline) {
        toast.error("Lead or pipeline not found");
        return;
      }
      
      // Create a new deal
      const deal = {
        leadId,
        leadName: lead.name,
        company: lead.company,
        stage: pipeline.stages[0],
        value: Math.floor(Math.random() * 10000) + 1000,
        createdAt: new Date().toISOString()
      };
      
      // Add the deal to the pipeline
      const pipelineRef = doc(db, `users/${user?.uid}/pipelines`, pipelineId);
      await updateDoc(pipelineRef, {
        deals: [...(pipeline.deals || []), deal]
      });
      
      toast.success(`Added ${lead.name} to pipeline`);
      fetchPipelines();
    } catch (error) {
      toast.error("Failed to add deal to pipeline");
    }
  };

  const moveStage = async (pipelineId: string, dealIndex: number, direction: 'forward' | 'backward') => {
    try {
      const pipeline = pipelines.find(p => p.id === pipelineId);
      if (!pipeline) return;
      
      const deals = [...pipeline.deals];
      const deal = deals[dealIndex];
      const currentStageIndex = pipeline.stages.indexOf(deal.stage);
      
      let newStageIndex;
      if (direction === 'forward' && currentStageIndex < pipeline.stages.length - 1) {
        newStageIndex = currentStageIndex + 1;
      } else if (direction === 'backward' && currentStageIndex > 0) {
        newStageIndex = currentStageIndex - 1;
      } else {
        return;
      }
      
      deals[dealIndex] = {
        ...deal,
        stage: pipeline.stages[newStageIndex],
        updatedAt: new Date().toISOString()
      };
      
      const pipelineRef = doc(db, `users/${user?.uid}/pipelines`, pipelineId);
      await updateDoc(pipelineRef, { deals });
      
      toast.success(`Moved ${deal.leadName} to ${pipeline.stages[newStageIndex]}`);
      fetchPipelines();
    } catch (error) {
      toast.error("Failed to move deal");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Pipeline Name</label>
          <Input
            placeholder="Enter pipeline name"
            value={newPipeline.name}
            onChange={(e) => setNewPipeline({...newPipeline, name: e.target.value})}
          />
        </div>
        <Button onClick={createPipeline} disabled={loading}>
          {loading ? "Creating..." : "Create Pipeline"}
        </Button>
      </div>
      
      {pipelines.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No pipelines created yet</p>
          <p className="text-sm">Create your first pipeline above</p>
        </div>
      ) : (
        pipelines.map((pipeline) => (
          <Card key={pipeline.id} className="overflow-hidden">
            <CardHeader className="bg-gray-50">
              <div className="flex justify-between items-center">
                <CardTitle>{pipeline.name}</CardTitle>
                <div className="flex gap-2">
                  <select 
                    className="border rounded p-1 text-sm"
                    onChange={(e) => {
                      if (e.target.value) {
                        addDealToPipeline(pipeline.id, e.target.value);
                        e.target.value = "";
                      }
                    }}
                    defaultValue=""
                  >
                    <option value="" disabled>Add lead to pipeline</option>
                    {leads.filter(lead => 
                      !pipeline.deals?.some((deal: any) => deal.leadId === lead.id)
                    ).map(lead => (
                      <option key={lead.id} value={lead.id}>
                        {lead.name} ({lead.company})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <div className="flex min-w-max">
                  {pipeline.stages.map((stage: string) => (
                    <div key={stage} className="w-64 p-4 border-r min-h-[300px]">
                      <h3 className="font-medium mb-3">{stage}</h3>
                      <div className="space-y-2">
                        {pipeline.deals?.filter((deal: any) => deal.stage === stage).map((deal: any, index: number) => (
                          <div key={index} className="bg-white p-3 rounded border shadow-sm">
                            <div className="font-medium">{deal.leadName}</div>
                            <div className="text-sm text-gray-600">{deal.company}</div>
                            <div className="text-sm font-medium text-green-600">${deal.value.toLocaleString()}</div>
                            <div className="flex justify-between mt-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => moveStage(pipeline.id, pipeline.deals.indexOf(deal), 'backward')}
                                disabled={pipeline.stages.indexOf(deal.stage) === 0}
                              >
                                ←
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => moveStage(pipeline.id, pipeline.deals.indexOf(deal), 'forward')}
                                disabled={pipeline.stages.indexOf(deal.stage) === pipeline.stages.length - 1}
                              >
                                →
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}