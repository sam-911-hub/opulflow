"use client";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TutorialsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <Link href="/help" className="text-indigo-600 hover:text-indigo-800 mb-4 inline-block">
            ← Back to Help
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Video Tutorials</h1>
          <p className="text-xl text-gray-600 mb-2">
            Learn how to use OpulFlow with our step-by-step video guides
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Video tutorial coming soon</p>
              </div>
              <h3 className="font-semibold">Introduction to OpulFlow</h3>
              <p className="text-gray-600">Learn the basics of OpulFlow&apos;s pay-as-you-go platform and how to navigate the dashboard.</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Lead Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Video tutorial coming soon</p>
              </div>
              <h3 className="font-semibold">Managing Leads in OpulFlow</h3>
              <p className="text-gray-600">Learn how to add, import, and manage leads in the OpulFlow platform.</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>AI Tools</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Video tutorial coming soon</p>
              </div>
              <h3 className="font-semibold">Using AI Email Generation</h3>
              <p className="text-gray-600">Learn how to create personalized sales emails using OpulFlow&apos;s AI tools.</p>
            </CardContent>
          </Card>
          
          <div className="text-center mt-8">
            <p className="text-gray-600">Need more help?</p>
            <p className="mt-2">
              <a href="mailto:opulflow.inc@gmail.com" className="text-indigo-600 hover:text-indigo-800">
                Contact our support team
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}