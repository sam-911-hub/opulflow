import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';

interface DashboardData {
  user: {
    email: string;
    name: string;
    phone: string;
    credits: Record<string, number>;
  };
  leads: any[];
  pipelines: any[];
  sequences: any[];
  stats: {
    totalLeads: number;
    totalPipelines: number;
    totalSequences: number;
  };
}

export function useDashboard() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['dashboard', user?.email],
    queryFn: async (): Promise<DashboardData> => {
      if (!user?.email) throw new Error('No user email');
      const response = await fetch(`/api/dashboard/batch?email=${encodeURIComponent(user.email)}`);
      if (!response.ok) throw new Error('Failed to fetch dashboard data');
      return response.json();
    },
    enabled: !!user?.email,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}