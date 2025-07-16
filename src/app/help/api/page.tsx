"use client";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function APIDocPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <Link href="/help" className="text-indigo-600 hover:text-indigo-800 mb-4 inline-block">
            ← Back to Help
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">API Documentation</h1>
          <p className="text-xl text-gray-600 mb-2">
            Integrate OpulFlow's services into your applications
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold">Authentication</h3>
                <p className="text-gray-600">All API requests require an API key. You can generate an API key in your dashboard under Settings → API Configuration.</p>
                <pre className="bg-gray-800 text-green-400 p-4 rounded mt-2 overflow-x-auto">
                  {`curl -H "Authorization: Bearer YOUR_API_KEY" https://api.opulflow.com/v1/leads`}
                </pre>
              </div>
              
              <div>
                <h3 className="font-semibold">Rate Limits</h3>
                <p className="text-gray-600">API requests are limited to 100 requests per minute. Each request consumes credits based on the service used.</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Lead Lookup API</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold">Endpoint</h3>
                <p className="text-gray-600">GET /v1/leads</p>
                <pre className="bg-gray-800 text-green-400 p-4 rounded mt-2 overflow-x-auto">
                  {`curl -H "Authorization: Bearer YOUR_API_KEY" https://api.opulflow.com/v1/leads?email=john@example.com`}
                </pre>
              </div>
              
              <div>
                <h3 className="font-semibold">Parameters</h3>
                <ul className="list-disc pl-5 text-gray-600">
                  <li><span className="font-medium">email</span>: Email address to lookup</li>
                  <li><span className="font-medium">domain</span>: Company domain to lookup</li>
                  <li><span className="font-medium">name</span>: Person's name to lookup</li>
                  <li><span className="font-medium">company</span>: Company name to lookup</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold">Response</h3>
                <pre className="bg-gray-800 text-green-400 p-4 rounded mt-2 overflow-x-auto">
                  {`{
  "id": "lead_123456",
  "name": "John Doe",
  "email": "john@example.com",
  "title": "CEO",
  "company": "Example Inc",
  "phone": "+1234567890",
  "linkedin": "https://linkedin.com/in/johndoe",
  "twitter": "@johndoe",
  "verified": true
}`}
                </pre>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Company Enrichment API</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold">Endpoint</h3>
                <p className="text-gray-600">GET /v1/companies</p>
                <pre className="bg-gray-800 text-green-400 p-4 rounded mt-2 overflow-x-auto">
                  {`curl -H "Authorization: Bearer YOUR_API_KEY" https://api.opulflow.com/v1/companies?domain=example.com`}
                </pre>
              </div>
              
              <div>
                <h3 className="font-semibold">Parameters</h3>
                <ul className="list-disc pl-5 text-gray-600">
                  <li><span className="font-medium">domain</span>: Company domain to lookup</li>
                  <li><span className="font-medium">name</span>: Company name to lookup</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold">Response</h3>
                <pre className="bg-gray-800 text-green-400 p-4 rounded mt-2 overflow-x-auto">
                  {`{
  "id": "company_123456",
  "name": "Example Inc",
  "domain": "example.com",
  "description": "Example company description",
  "industry": "Technology",
  "size": "51-200",
  "founded": 2010,
  "location": "San Francisco, CA",
  "funding": "$10M Series A",
  "technologies": ["React", "Node.js", "AWS"],
  "social": {
    "linkedin": "https://linkedin.com/company/example",
    "twitter": "@example"
  }
}`}
                </pre>
              </div>
            </CardContent>
          </Card>
          
          <div className="text-center mt-8">
            <p className="text-gray-600">Need more information?</p>
            <p className="mt-2">
              <a href="mailto:opulflow.inc@gmail.com" className="text-indigo-600 hover:text-indigo-800">
                Contact our API support team
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}