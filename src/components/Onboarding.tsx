"use client";
import { useState, useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { toast } from "sonner";

export default function Onboarding() {
  const { user } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) checkOnboardingStatus();
  }, [user]);

  const checkOnboardingStatus = async () => {
    try {
      const userDoc = await getDoc(doc(db, "users", user!.uid));
      const userData = userDoc.data();
      
      // If onboardingCompleted doesn't exist or is false, show onboarding
      setShowOnboarding(!userData?.onboardingCompleted);
      setLoading(false);
    } catch (error) {
      console.error("Error checking onboarding status:", error);
      setLoading(false);
    }
  };

  const completeOnboarding = async () => {
    try {
      await updateDoc(doc(db, "users", user!.uid), {
        onboardingCompleted: true
      });
      
      setShowOnboarding(false);
      toast.success("Onboarding completed!");
    } catch (error) {
      console.error("Error completing onboarding:", error);
      toast.error("Failed to complete onboarding");
    }
  };

  const steps = [
    {
      title: "Welcome to OpulFlow",
      content: "OpulFlow is a pay-as-you-go sales intelligence platform. Let's get you started with the basics.",
      image: "🎉"
    },
    {
      title: "Buy Credits",
      content: "Purchase credits to use our services. You only pay for what you use - no subscriptions or lock-in.",
      image: "💳"
    },
    {
      title: "Find Leads",
      content: "Use our lead lookup tool to find contact information for potential customers.",
      image: "👥"
    },
    {
      title: "Enrich Data",
      content: "Get detailed company information and verify email addresses to improve your outreach.",
      image: "🏢"
    },
    {
      title: "Track Performance",
      content: "Monitor your email deliverability, intent signals, and ROI to optimize your sales process.",
      image: "📊"
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (loading || !showOnboarding) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Onboarding ({currentStep + 1}/{steps.length})</span>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={completeOnboarding}
            >
              Skip
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <div className="text-5xl mb-4">{steps[currentStep].image}</div>
            <h3 className="text-xl font-bold mb-2">{steps[currentStep].title}</h3>
            <p className="text-gray-600 mb-6">{steps[currentStep].content}</p>
            
            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={prevStep}
                disabled={currentStep === 0}
              >
                Previous
              </Button>
              <Button onClick={nextStep}>
                {currentStep === steps.length - 1 ? "Finish" : "Next"}
              </Button>
            </div>
          </div>
          
          <div className="flex justify-center mt-4">
            {steps.map((_, index) => (
              <div 
                key={index}
                className={`w-2 h-2 rounded-full mx-1 ${
                  index === currentStep ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}