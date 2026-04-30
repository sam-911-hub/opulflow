"use client";

import { useState, useEffect } from "react";
import { X, CheckCircle, MessageSquare, Users, Search, Star, FileText } from "lucide-react";
import { toast } from "@/components/ui/toast";

interface OnboardingModalProps {
  onClose: () => void;
}

export default function OnboardingModal({ onClose }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "🎉 Welcome to OpulFlow!",
      content: (
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600 mb-4">
            Congratulations! You've successfully created your account and received <span className="font-bold text-green-600">20 FREE comments</span> to get started.
          </p>
          <p className="text-sm text-gray-500">
            Let's show you how to make the most of your OpulFlow experience.
          </p>
        </div>
      )
    },
    {
      title: "💬 Comment Writing Service",
      content: (
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Professional Comment Writing</h4>
              <p className="text-gray-600 text-sm">
                Our team of experts writes authentic, engaging comments for your social media posts.
                Perfect for increasing engagement and driving traffic to your content.
              </p>
            </div>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>How it works:</strong> Choose your platforms, specify your product, and our team handles the rest.
              You receive screenshots and detailed reports of all posted comments.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "🔍 Product Research Services",
      content: (
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Search className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Manual Product Research</h4>
              <p className="text-gray-600 text-sm">
                Get detailed, human-researched product information and market analysis.
                Perfect for understanding your competitors and market trends.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Influencer Research</h4>
              <p className="text-gray-600 text-sm">
                Discover and analyze relevant influencers in your niche.
                Get detailed profiles, engagement metrics, and collaboration opportunities.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "📝 Content Enhancement",
      content: (
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Star className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Product Reviews</h4>
              <p className="text-gray-600 text-sm">
                Professional product reviews and testimonials to build credibility and trust with your audience.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">AI Content Humanization</h4>
              <p className="text-gray-600 text-sm">
                Transform AI-generated content into natural, human-like writing that resonates with readers.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Getting Started",
      content: (
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto">
            <span className="text-2xl">🎯</span>
          </div>
          <h4 className="font-semibold text-gray-900">Ready to Get Started?</h4>
          <p className="text-gray-600 text-sm">
            You have <span className="font-bold text-green-600">20 free comments</span> waiting for you.
            Click the button below to place your first order and see OpulFlow in action!
          </p>
          <div className="bg-green-50 p-3 rounded-lg">
            <p className="text-sm text-green-800">
              💡 <strong>Pro tip:</strong> Start with comment writing to boost your social media engagement immediately.
            </p>
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
    localStorage.setItem('onboardingCompleted', 'true');
    toast.success('Welcome to OpulFlow! Ready to place your first order?');
    onClose();
  };

  const handleSkip = () => {
    localStorage.setItem('onboardingCompleted', 'true');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{steps[currentStep].title}</h2>
          <button
            onClick={handleSkip}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Skip onboarding"
          >
            <X size={20} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-2">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 text-center mt-1">
            {currentStep + 1} of {steps.length}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4 max-h-96 overflow-y-auto">
          {steps[currentStep].content}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <div className="flex space-x-2">
            <button
              onClick={handleSkip}
              className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              Skip
            </button>
            <button
              onClick={nextStep}
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200"
            >
              {currentStep === steps.length - 1 ? 'Get Started!' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}