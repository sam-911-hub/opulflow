import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  text?: string;
}

export function LoadingSpinner({ size = 'md', className, text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={cn(
        "animate-spin rounded-full border-2 border-gray-200",
        "border-t-blue-500 border-r-purple-500",
        sizeClasses[size],
        className
      )} />
      {text && (
        <p className="text-sm text-gray-600 font-medium animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
}

export function FullPageLoader({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="text-center">
        <div className="w-16 h-16 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500 border-r-purple-500 mx-auto mb-4" />
        <p className="text-lg font-semibold text-gray-700 animate-pulse">{text}</p>
        <p className="text-sm text-gray-500 mt-2">Please wait while we load your dashboard</p>
      </div>
    </div>
  );
}