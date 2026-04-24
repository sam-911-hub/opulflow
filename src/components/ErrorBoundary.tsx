"use client";

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details in development only
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Boundary caught an error:', error, errorInfo);
    }

    // In production, you could send to logging service
    // Example: sendToLoggingService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Render custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-[#0d1117]">
          <div className="bg-[#161b22] border border-[#30363d] p-8 rounded-md w-full max-w-md text-center">
            <h1 className="text-2xl font-semibold mb-4 text-[#e6edf3]">Oops! Something went wrong</h1>
            <p className="text-[#848d97] mb-6">
              We encountered an unexpected error. Our team has been notified.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-[#238636] hover:bg-[#2ea043] text-white py-2 px-4 rounded-md transition-colors font-medium"
            >
              Refresh Page
            </button>
            <p className="text-[#848d97] mt-4 text-sm">
              If the problem persists, contact support at{' '}
              <a href="mailto:opulflow.inc@gmail.com" className="text-[#2f81f7] hover:text-[#79c0ff]">
                opulflow.inc@gmail.com
              </a>
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;