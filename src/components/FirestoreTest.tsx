"use client";

import { useState } from "react";
import { testFirestoreConnection } from "@/lib/firestoreTest";

export default function FirestoreTest() {
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runTest = async () => {
    setLoading(true);
    try {
      const result = await testFirestoreConnection();
      setTestResult(result);
    } catch (error) {
      setTestResult({ success: false, message: "Test failed", error });
    }
    setLoading(false);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-4">🔍 Firestore Connection Test</h2>

      <button
        onClick={runTest}
        disabled={loading}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? "Testing..." : "Test Firestore Connection"}
      </button>

      {testResult && (
        <div className={`mt-4 p-4 rounded ${testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
          <h3 className={`font-semibold ${testResult.success ? 'text-green-800' : 'text-red-800'}`}>
            {testResult.success ? "✅ Success" : "❌ Failed"}
          </h3>
          <p className={`mt-2 ${testResult.success ? 'text-green-700' : 'text-red-700'}`}>
            {testResult.message}
          </p>
          {testResult.suggestion && (
            <p className="mt-2 text-sm text-blue-600">
              💡 <strong>Suggestion:</strong> {testResult.suggestion}
            </p>
          )}
        </div>
      )}

      <div className="mt-4 text-sm text-gray-600">
        <p><strong>What this test checks:</strong></p>
        <ul className="list-disc list-inside mt-1">
          <li>Firebase configuration is loaded</li>
          <li>Firestore instance can be created</li>
          <li>Database is accessible</li>
          <li>Security rules are working</li>
        </ul>
      </div>
    </div>
  );
}