'use client';
import { useState, useEffect } from 'react';
import { Card } from './ui/card';

type DashboardStats = {
  currentCredits: {
    leads: number;
    companies: number;
    emails: number;
    ai: number;
    techstack: number;
    intent: number;
    calls: number;
    crm: number;
    workflows: number;
  };
  creditUsage: number;
  creditPurchases: number;
  contactsCount: number;
  recentActivities: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
  }>;
  period: string;
};

export default function DashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState('30d');
  
  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        const response = await fetch(`/api/dashboard/stats?period=${period}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard stats');
        }
        
        const data = await response.json();
        setStats(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError('Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    }
    
    fetchStats();
  }, [period]);
  
  const handlePeriodChange = (newPeriod: string) => {
    setPeriod(newPeriod);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-xl text-red-800 border border-red-200">
        <p>{error}</p>
        <button 
          onClick={() => setPeriod(period)} 
          className="mt-2 text-sm text-red-600 hover:text-red-800 transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }
  
  if (!stats) {
    return null;
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-orange-900">Dashboard Overview</h2>
        <div className="flex space-x-2">
          <PeriodButton active={period === '7d'} onClick={() => handlePeriodChange('7d')}>7 Days</PeriodButton>
          <PeriodButton active={period === '30d'} onClick={() => handlePeriodChange('30d')}>30 Days</PeriodButton>
          <PeriodButton active={period === '90d'} onClick={() => handlePeriodChange('90d')}>90 Days</PeriodButton>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Available Credits" value={Object.values(stats.currentCredits).reduce((sum, val) => sum + val, 0)} />
        <StatCard title="Credits Used" value={stats.creditUsage} />
        <StatCard title="Contacts" value={stats.contactsCount} />
      </div>
      
      <div className="mt-8">
        <h3 className="text-lg font-medium mb-6 text-orange-900">Recent Activity</h3>
        <div className="space-y-3">
          {stats.recentActivities && stats.recentActivities.length > 0 ? (
            stats.recentActivities.map(activity => (
              <div key={activity.id} className="flex justify-between p-4 modern-card glass-effect hover:scale-102 transition-all duration-300">
                <div>
                  <p className="font-medium text-orange-900">{activity.description}</p>
                  <p className="text-sm text-orange-600">{activity.type}</p>
                </div>
                <div className="text-sm text-orange-600">
                  {new Date(activity.timestamp).toLocaleString()}
                </div>
              </div>
            ))
          ) : (
            <p className="text-orange-600 text-center py-8">No recent activities</p>
          )}
        </div>
      </div>
    </div>
  );
}

function PeriodButton({ 
  children, 
  active, 
  onClick 
}: { 
  children: React.ReactNode; 
  active: boolean; 
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm rounded-xl font-medium transition-all duration-300 ${
        active 
          ? 'gradient-primary text-white shadow-lg scale-105' 
          : 'bg-orange-50 text-orange-700 hover:bg-orange-100 hover:scale-105'
      }`}
    >
      {children}
    </button>
  );
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <Card className="p-6 modern-card glass-effect hover:scale-105 transition-all duration-300">
      <h3 className="text-orange-600 text-sm font-medium uppercase tracking-wide">{title}</h3>
      <p className="text-3xl font-bold mt-3 text-orange-900">{value.toLocaleString()}</p>
    </Card>
  );
}