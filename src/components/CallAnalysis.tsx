"use client";
import { useState, useEffect } from "react";
import { collection, getDocs, addDoc, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { CallAnalysis as CallAnalysisType } from "@/types/interfaces";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import useCredits from "@/hooks/useCredits";

export default function CallAnalysis() {
  const { user } = useAuth();
  const { deductCredits } = useCredits();
  const [analyses, setAnalyses] = useState<CallAnalysisType[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    if (user) fetchAnalyses();
  }, [user]);

  const fetchAnalyses = async () => {
    try {
      const q = query(
        collection(db, `users/${user?.uid}/callAnalyses`),
        orderBy("createdAt", "desc"),
        limit(50)
      );
      
      const querySnapshot = await getDocs(q);
      setAnalyses(querySnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as CallAnalysisType)));
      
      setLoading(false);
    } catch (error) {
      console.error("Error fetching call analyses:", error);
      toast.error("Failed to load call analyses");
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      // For demo purposes, set a random duration between 1-30 minutes
      setCallDuration(Math.floor(Math.random() * 30) + 1);
    }
  };

  const analyzeCall = async () => {
    if (!uploadedFile) {
      toast.error("Please upload a call recording");
      return;
    }

    // Calculate credits needed based on call duration (1 credit per minute)
    const creditsNeeded = Math.max(1, Math.ceil(callDuration));

    // Check if we have credits
    const success = await deductCredits('call_analysis', creditsNeeded);
    if (!success) {
      toast.error("Insufficient call analysis credits");
      return;
    }

    setAnalyzing(true);
    try {
      // In a real implementation, this would upload the file and call your AI service
      // For now, we'll simulate analysis
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Generate random analysis results
      const sentiments = ['positive', 'neutral', 'negative'] as const;
      const sentiment = sentiments[Math.floor(Math.random() * sentiments.length)];
      
      const possibleKeywords = [
        'pricing', 'features', 'competition', 'timeline', 'budget', 
        'implementation', 'support', 'integration', 'security', 'compliance',
        'demo', 'trial', 'discount', 'contract', 'decision maker'
      ];
      
      const keywords = [...possibleKeywords]
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.floor(Math.random() * 5) + 3);
      
      const possibleInsights = [
        'Customer showed interest in premium features',
        'Price sensitivity detected',
        'Competitor mentioned frequently',
        'Decision timeline is within 2 weeks',
        'Technical concerns about integration',
        'Security compliance is a priority',
        'Budget constraints mentioned',
        'Multiple stakeholders involved in decision',
        'Follow-up demo requested',
        'Objection about implementation timeline'
      ];
      
      const insights = [...possibleInsights]
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.floor(Math.random() * 4) + 2);
      
      // Create a simulated transcript snippet
      const transcriptSnippets = [
        "Customer: I'm interested in your solution, but I'm concerned about the pricing.",
        "Sales: Our pricing is competitive and we offer flexible plans based on your needs.",
        "Customer: How does your solution compare to [Competitor]?",
        "Sales: We offer more features and better support at a similar price point.",
        "Customer: What about implementation? How long does it typically take?",
        "Sales: Most customers are up and running within 2-3 weeks.",
        "Customer: And what kind of support do you provide?",
        "Sales: We offer 24/7 support via email, chat, and phone."
      ];
      
      const transcript = transcriptSnippets
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.floor(Math.random() * 5) + 3)
        .join("\n\n");
      
      // Create analysis object
      const analysisData: Omit<CallAnalysisType, 'id'> = {
        callId: `call-${Date.now()}`,
        duration: callDuration,
        transcript,
        sentiment,
        keywords,
        insights,
        createdAt: new Date().toISOString()
      };
      
      // Add to Firestore
      await addDoc(collection(db, `users/${user?.uid}/callAnalyses`), analysisData);
      
      toast.success("Call analyzed successfully");
      setUploadedFile(null);
      fetchAnalyses();
    } catch (error) {
      console.error("Error analyzing call:", error);
      toast.error("Failed to analyze call");
    } finally {
      setAnalyzing(false);
    }
  };

  const getSentimentColor = (sentiment: CallAnalysisType['sentiment']) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600';
      case 'neutral': return 'text-blue-600';
      case 'negative': return 'text-red-600';
      default: return '';
    }
  };

  const getSentimentIcon = (sentiment: CallAnalysisType['sentiment']) => {
    switch (sentiment) {
      case 'positive': return '😀';
      case 'neutral': return '😐';
      case 'negative': return '😟';
      default: return '';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Analyze Sales Call</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Upload Call Recording</label>
              <Input
                type="file"
                accept="audio/*"
                onChange={handleFileChange}
                disabled={analyzing}
              />
              <p className="text-xs text-gray-500 mt-1">
                Supported formats: MP3, WAV, M4A (max 500MB)
              </p>
            </div>
            
            {uploadedFile && (
              <div className="bg-blue-50 p-3 rounded-md">
                <p className="text-sm font-medium">File: {uploadedFile.name}</p>
                <p className="text-xs text-gray-600">Duration: {callDuration} minutes</p>
                <p className="text-xs text-gray-600">Credits required: {Math.max(1, Math.ceil(callDuration))}</p>
              </div>
            )}
            
            <Button 
              onClick={analyzeCall} 
              disabled={analyzing || !uploadedFile}
              className="w-full"
            >
              {analyzing ? "Analyzing..." : "Analyze Call"}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {analyses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Call Analyses</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">Loading analyses...</div>
            ) : (
              <div className="space-y-6">
                {analyses.map((analysis) => (
                  <div key={analysis.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="font-medium">Call {analysis.callId}</h3>
                        <p className="text-sm text-gray-500">
                          {analysis.duration} minutes • {new Date(analysis.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className={`flex items-center gap-1 ${getSentimentColor(analysis.sentiment)}`}>
                        <span>{getSentimentIcon(analysis.sentiment)}</span>
                        <span className="capitalize">{analysis.sentiment}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Key Topics</h4>
                        <div className="flex flex-wrap gap-2">
                          {analysis.keywords.map((keyword, index) => (
                            <span 
                              key={index}
                              className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Insights</h4>
                        <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                          {analysis.insights.map((insight, index) => (
                            <li key={index}>{insight}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    {analysis.transcript && (
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">Transcript Excerpt</h4>
                        <div className="bg-gray-50 p-3 rounded text-sm text-gray-700 max-h-32 overflow-y-auto">
                          <pre className="whitespace-pre-wrap font-sans">{analysis.transcript}</pre>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Call Analysis Benefits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4">
              <div className="text-2xl mb-2">🔍</div>
              <h3 className="font-medium mb-1">Identify Patterns</h3>
              <p className="text-sm text-gray-600">Discover recurring themes and objections across your sales calls.</p>
            </div>
            
            <div className="border rounded-lg p-4">
              <div className="text-2xl mb-2">📈</div>
              <h3 className="font-medium mb-1">Improve Conversion</h3>
              <p className="text-sm text-gray-600">Learn what works and what doesn't to close more deals.</p>
            </div>
            
            <div className="border rounded-lg p-4">
              <div className="text-2xl mb-2">🎯</div>
              <h3 className="font-medium mb-1">Better Follow-ups</h3>
              <p className="text-sm text-gray-600">Create targeted follow-up messages based on call insights.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}