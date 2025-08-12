import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from './button';

interface ErrorMessageProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  onHome?: () => void;
  showRetry?: boolean;
  showHome?: boolean;
}

export function ErrorMessage({
  title = "Something went wrong",
  message = "We encountered an unexpected error. Please try again.",
  onRetry,
  onHome,
  showRetry = true,
  showHome = false
}: ErrorMessageProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <AlertTriangle className="w-8 h-8 text-red-500" />
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-md">{message}</p>
      
      <div className="flex gap-3">
        {showRetry && onRetry && (
          <Button
            onClick={onRetry}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-xl transition-all duration-200 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
        )}
        
        {showHome && onHome && (
          <Button
            onClick={onHome}
            variant="outline"
            className="px-6 py-2 rounded-xl transition-all duration-200 flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Button>
        )}
      </div>
    </div>
  );
}

export function InlineError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
        <p className="text-red-700 text-sm">{message}</p>
      </div>
      {onRetry && (
        <Button
          onClick={onRetry}
          size="sm"
          variant="outline"
          className="text-red-600 border-red-300 hover:bg-red-50"
        >
          Retry
        </Button>
      )}
    </div>
  );
}