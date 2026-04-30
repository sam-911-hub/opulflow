"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, MessageSquare, Users, Search, Star, FileText, ArrowRight, ArrowLeft } from "lucide-react";
import { toast } from "@/components/ui/toast";
import Link from "next/link";

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated and onboarding not completed
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/user');
        if (!res.ok) {
          router.push('/login');
          return;
        }
        const data = await res.json();
        setUserId(data.user.uid);

        const onboardingCompletedKey = `onboardingCompleted_${data.user.uid}`;
        const onboardingCompleted = localStorage.getItem(onboardingCompletedKey);

        if (onboardingCompleted) {
          router.push('/dashboard');
          return;
        }

        setIsLoading(false);
      } catch (error) {
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  const steps = [
    {
      title: "🎉 Welcome to OpulFlow!",
      subtitle: "Your journey to better online presence starts here",
      content: (
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Welcome aboard!</h3>
            <p className="text-gray-600 text-lg">
              You've successfully created your account and received <span className="font-bold text-green-600">20 FREE comments</span> to get started.
            </p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-blue-800">
              <strong>Ready to boost your online presence?</strong> Let's show you how OpulFlow can help you grow your social media engagement and credibility.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "💬 Comment Writing Service",
      subtitle: "Professional comments that drive engagement",
      content: (
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Authentic Comment Writing</h4>
              <p className="text-gray-600 mb-3">
                Our expert team writes genuine, engaging comments for your social media posts across all major platforms.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <h5 className="font-medium text-blue-900 mb-1">What you get:</h5>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Screenshots of all posted comments</li>
                    <li>• Detailed engagement reports</li>
                    <li>• Platform-specific optimization</li>
                  </ul>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <h5 className="font-medium text-green-900 mb-1">Perfect for:</h5>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• Boosting post visibility</li>
                    <li>• Increasing follower engagement</li>
                    <li>• Driving traffic to your content</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "🔍 Research & Discovery",
      subtitle: "Uncover insights and opportunities",
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Search className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">Product Research</h4>
                <p className="text-gray-600 mb-3">
                  Get comprehensive market research and competitor analysis for your products.
                </p>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>Manual research by experts</strong> - not automated scraping. Real insights for real decisions.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">Influencer Discovery</h4>
                <p className="text-gray-600 mb-3">
                  Find and analyze relevant influencers in your niche for collaboration opportunities.
                </p>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <p className="text-sm text-purple-800">
                    <strong>Detailed profiles</strong> including engagement rates, audience demographics, and collaboration history.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "📝 Content Enhancement",
      subtitle: "Transform your content into engaging experiences",
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Star className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">Professional Reviews</h4>
                <p className="text-gray-600 mb-3">
                  Authentic product reviews and testimonials that build trust and credibility.
                </p>
                <div className="bg-orange-50 p-3 rounded-lg">
                  <p className="text-sm text-orange-800">
                    <strong>Custom-written reviews</strong> tailored to your product and target audience.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">AI Content Humanization</h4>
                <p className="text-gray-600 mb-3">
                  Transform AI-generated content into natural, human-like writing.
                </p>
                <div className="bg-teal-50 p-3 rounded-lg">
                  <p className="text-sm text-teal-800">
                    <strong>Make your content authentic</strong> - perfect for blogs, social posts, and marketing copy.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Let's Get Started!",
      subtitle: "Your first order is just a few clicks away",
      content: (
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto">
            <span className="text-3xl">🎯</span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Ready to Supercharge Your Online Presence?</h3>
            <p className="text-gray-600 text-lg mb-4">
              You have <span className="font-bold text-green-600">20 free comments</span> waiting for you.
            </p>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-3">💡 Pro Tips to Get Started:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div>
                <h5 className="font-medium text-blue-900 mb-2">Immediate Impact:</h5>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Start with comment writing</li>
                  <li>• Choose 2-3 active platforms</li>
                  <li>• Target your best-performing posts</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-purple-900 mb-2">Long-term Growth:</h5>
                <ul className="text-sm text-purple-800 space-y-1">
                  <li>• Research your competitors</li>
                  <li>• Build influencer relationships</li>
                  <li>• Create consistent posting schedules</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    const onboardingKey = userId ? `onboardingCompleted_${userId}` : 'onboardingCompleted';
    localStorage.setItem(onboardingKey, 'true');
    toast.success('Welcome to OpulFlow! Ready to place your first order?');
    router.push('/dashboard');
  };

  const handleSkip = () => {
    const onboardingKey = userId ? `onboardingCompleted_${userId}` : 'onboardingCompleted';
    localStorage.setItem(onboardingKey, 'true');
    router.push('/dashboard');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">OP</span>
            </div>
            <span className="text-xl font-bold text-slate-900">OpulFlow</span>
          </div>
          <button
            onClick={handleSkip}
            className="text-gray-500 hover:text-gray-700 text-sm font-medium"
          >
            Skip onboarding
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
        <div className="text-sm text-gray-600 text-center mt-2">
          Step {currentStep + 1} of {steps.length}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 pb-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Step Header */}
          <div className="px-8 py-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white">
            <h1 className="text-3xl font-bold mb-2">{steps[currentStep].title}</h1>
            <p className="text-blue-100 text-lg">{steps[currentStep].subtitle}</p>
          </div>

          {/* Step Content */}
          <div className="px-8 py-8">
            {steps[currentStep].content}
          </div>

          {/* Navigation */}
          <div className="px-8 py-6 bg-gray-50 border-t flex items-center justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={handleSkip}
                className="px-4 py-3 text-gray-500 hover:text-gray-700 font-medium"
              >
                Skip for now
              </button>
              <button
                onClick={nextStep}
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200"
              >
                {currentStep === steps.length - 1 ? 'Get Started!' : 'Next'}
                {currentStep < steps.length - 1 && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}