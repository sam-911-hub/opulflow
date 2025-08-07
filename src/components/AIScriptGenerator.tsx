"use client";
import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent } from "./ui/card";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import useCredits from "@/hooks/useCredits";

export default function AIScriptGenerator() {
  const { user } = useAuth();
  const { deductCredits } = useCredits();
  const [prompt, setPrompt] = useState("");
  const [script, setScript] = useState("");
  const [loading, setLoading] = useState(false);

  const generateScript = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    // Check and deduct AI credits
    const success = await deductCredits('ai', 1);
    if (!success) return;

    setLoading(true);
    try {
      // Simulate AI generation with more realistic script
      const generatedScript = `// AI Generated Script for: ${prompt}
// Generated on: ${new Date().toLocaleString()}

class AutomationScript {
  constructor() {
    this.name = "${prompt.replace(/[^a-zA-Z0-9]/g, '_')}";
    this.createdAt = new Date();
  }

  async execute() {
    console.log('Starting automation:', this.name);
    
    try {
      // Main automation logic
      await this.processData();
      await this.performActions();
      
      console.log('Automation completed successfully');
      return { success: true, message: 'Task completed' };
    } catch (error) {
      console.error('Automation failed:', error);
      return { success: false, error: error.message };
    }
  }

  async processData() {
    // Data processing logic here
    console.log('Processing data...');
  }

  async performActions() {
    // Action execution logic here
    console.log('Performing actions...');
  }
}

// Usage
const automation = new AutomationScript();
automation.execute().then(result => {
  console.log('Result:', result);
});`;

      // Save to Firestore
      await addDoc(collection(db, `users/${user?.uid}/aiGenerations`), {
        prompt,
        script: generatedScript,
        createdAt: new Date().toISOString(),
        creditsUsed: 1
      });

      setScript(generatedScript);
      toast.success("AI script generated successfully!");
    } catch (error) {
      console.error("Error generating script:", error);
      toast.error("Failed to generate script");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Describe what you want to automate..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <Button onClick={generateScript} disabled={loading}>
          {loading ? "Generating..." : "Generate"}
        </Button>
      </div>
      
      {script && (
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium">Generated Script</h4>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => navigator.clipboard.writeText(script)}
              >
                Copy Code
              </Button>
            </div>
            <pre className="bg-gray-900 text-green-400 p-4 rounded text-sm overflow-x-auto max-h-96">
              {script}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}