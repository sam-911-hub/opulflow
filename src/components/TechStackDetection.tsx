"use client";
import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import useCredits from "@/hooks/useCredits";

export default function TechStackDetection() {
  const { user } = useAuth();
  const { deductCredits } = useCredits();
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const detectTechStack = async () => {
    if (!domain.trim()) {
      toast.error("Please enter a domain");
      return;
    }

    // Check if we have credits
    const success = await deductCredits('tech_detection', 1);
    if (!success) {
      toast.error("Insufficient tech detection credits");
      return;
    }

    setLoading(true);
    try {
      // Simulate API call to tech detection service
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Sample tech stack data
      const techCategories = [
        {
          category: "Frontend",
          technologies: [
            { name: "React", confidence: 0.95 },
            { name: "Next.js", confidence: 0.85 },
            { name: "TailwindCSS", confidence: 0.9 }
          ]
        },
        {
          category: "Backend",
          technologies: [
            { name: "Node.js", confidence: 0.8 },
            { name: "Express", confidence: 0.7 }
          ]
        },
        {
          category: "Database",
          technologies: [
            { name: "MongoDB", confidence: 0.6 }
          ]
        },
        {
          category: "Hosting",
          technologies: [
            { name: "AWS", confidence: 0.75 },
            { name: "Vercel", confidence: 0.85 }
          ]
        },
        {
          category: "Analytics",
          technologies: [
            { name: "Google Analytics", confidence: 0.9 },
            { name: "Hotjar", confidence: 0.6 }
          ]
        },
        {
          category: "Marketing",
          technologies: [
            { name: "HubSpot", confidence: 0.7 },
            { name: "Mailchimp", confidence: 0.5 }
          ]
        }
      ];
      
      // Randomly remove some technologies to make it more realistic
      const filteredTechCategories = techCategories
        .map(category => ({
          ...category,
          technologies: category.technologies.filter(() => Math.random() > 0.3)
        }))
        .filter(category => category.technologies.length > 0);
      
      const detectionResults = {
        domain,
        detectedAt: new Date().toISOString(),
        techCategories: filteredTechCategories
      };
      
      // Save to Firestore
      await addDoc(collection(db, `users/${user?.uid}/techDetections`), detectionResults);
      
      setResults(detectionResults);
      toast.success(`Tech stack detected for ${domain}`);
    } catch (error) {
      toast.error("Failed to detect tech stack");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tech Stack Detection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Enter domain (e.g., example.com)"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="flex-1"
            />
            <Button onClick={detectTechStack} disabled={loading}>
              {loading ? "Detecting..." : "Detect Tech Stack"}
            </Button>
          </div>
          
          {results && (
            <div className="mt-6">
              <h3 className="font-medium text-lg mb-4">Tech Stack for {results.domain}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.techCategories.map((category: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">{category.category}</h4>
                    <ul className="space-y-2">
                      {category.technologies.map((tech: any, techIndex: number) => (
                        <li key={techIndex} className="flex items-center justify-between">
                          <span>{tech.name}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-blue-500 rounded-full" 
                                style={{ width: `${tech.confidence * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-500">{Math.round(tech.confidence * 100)}%</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 text-sm text-gray-500">
                <p>Detection performed on {new Date(results.detectedAt).toLocaleString()}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}