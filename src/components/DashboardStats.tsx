'use client';
import { useState, useEffect } from 'react';
import { Card } from './ui/card';

type DashboardStats = {
  currentCredits: number;
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md text-red-800">
        <p>{error}</p>
        <button 
          onClick={() => setPeriod(period)} 
          className="mt-2 text-sm text-red-600 hover:text-red-800"
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
        <h2 className="text-2xl font-bold">Dashboard Overview</h2>
        <div className="flex space-x-2">
          <PeriodButton active={period === '7d'} onClick={() => handlePeriodChange('7d')}>7 Days</PeriodButton>
          <PeriodButton active={period === '30d'} onClick={() => handlePeriodChange('30d')}>30 Days</PeriodButton>
          <PeriodButton active={period === '90d'} onClick={() => handlePeriodChange('90d')}>90 Days</PeriodButton>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Available Credits" value={stats.currentCredits} />
        <StatCard title="Credits Used" value={stats.creditUsage} />
        <StatCard title="Contacts" value={stats.contactsCount} />
      </div>
      
      <div className="mt-8">
        <h3 className="text-lg font-medium mb-4">Recent Activity</h3>
        <div className="space-y-2">
          {stats.recentActivities && stats.recentActivities.length > 0 ? (
            stats.recentActivities.map(activity => (
              <div key={activity.id} className="flex justify-between p-3 bg-white rounded-md shadow-sm">
                <div>
                  <p className="font-medium">{activity.description}</p>
                  <p className="text-sm text-gray-500">{activity.type}</p>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(activity.timestamp).toLocaleString()}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No recent activities</p>
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
      className={`px-3 py-1 text-sm rounded-md ${
        active 
          ? 'bg-primary text-white' 
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      {children}
    </button>
  );
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <Card className="p-4">
      <h3 className="text-gray-500 text-sm">{title}</h3>
      <p className="text-2xl font-bold mt-2">{value.toLocaleString()}</p>
    </Card>
  );
}