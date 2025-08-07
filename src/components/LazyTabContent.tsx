import { Suspense, lazy } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load heavy components
const ContactManager = lazy(() => import('@/components/ContactManager'));
const PipelineManagement = lazy(() => import('@/components/PipelineManagement'));
const WorkflowAutomation = lazy(() => import('@/components/WorkflowAutomation'));
const AIScriptGenerator = lazy(() => import('@/components/AIScriptGenerator'));
const EmailSequences = lazy(() => import('@/components/EmailSequences'));
const TechStackDetection = lazy(() => import('@/components/TechStackDetection'));
const ROICalculator = lazy(() => import('@/components/ROICalculator'));
const EmailDeliveryTracking = lazy(() => import('@/components/EmailDeliveryTracking'));
const IntentSignals = lazy(() => import('@/components/IntentSignals'));
const CRMSyncSetup = lazy(() => import('@/components/CRMSyncSetup'));
const SourceTracking = lazy(() => import('@/components/SourceTracking'));
const CallAnalysis = lazy(() => import('@/components/CallAnalysis'));
const BrowserExtension = lazy(() => import('@/components/BrowserExtension'));

const TabSkeleton = () => (
  <div className="space-y-6">
    <div className="bg-gradient-to-r from-gray-50 to-white p-6 rounded-2xl">
      <Skeleton className="h-8 w-64 mb-4" />
      <Skeleton className="h-4 w-96" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white p-6 rounded-xl shadow-lg">
          <Skeleton className="h-6 w-32 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ))}
    </div>
  </div>
);

interface LazyTabContentProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function LazyTabContent({ activeTab, setActiveTab }: LazyTabContentProps) {
  const renderTabContent = () => {
    switch (activeTab) {
      case 'leads':
        return (
          <Suspense fallback={<TabSkeleton />}>
            <ContactManager />
          </Suspense>
        );
      case 'pipeline':
        return (
          <Suspense fallback={<TabSkeleton />}>
            <PipelineManagement />
          </Suspense>
        );
      case 'automation':
        return (
          <Suspense fallback={<TabSkeleton />}>
            <div className="space-y-6">
              <WorkflowAutomation />
              <AIScriptGenerator />
              <EmailSequences />
            </div>
          </Suspense>
        );
      case 'analytics':
        return (
          <Suspense fallback={<TabSkeleton />}>
            <div className="space-y-6">
              <TechStackDetection />
              <ROICalculator />
            </div>
          </Suspense>
        );
      case 'email':
        return (
          <Suspense fallback={<TabSkeleton />}>
            <EmailDeliveryTracking />
          </Suspense>
        );
      case 'intent':
        return (
          <Suspense fallback={<TabSkeleton />}>
            <IntentSignals />
          </Suspense>
        );
      case 'crm':
        return (
          <Suspense fallback={<TabSkeleton />}>
            <CRMSyncSetup />
          </Suspense>
        );
      case 'sources':
        return (
          <Suspense fallback={<TabSkeleton />}>
            <SourceTracking />
          </Suspense>
        );
      case 'calls':
        return (
          <Suspense fallback={<TabSkeleton />}>
            <CallAnalysis />
          </Suspense>
        );
      case 'extension':
        return (
          <Suspense fallback={<TabSkeleton />}>
            <BrowserExtension />
          </Suspense>
        );
      default:
        return null;
    }
  };

  return <>{renderTabContent()}</>;
}