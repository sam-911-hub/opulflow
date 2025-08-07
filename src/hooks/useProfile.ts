import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface ProfileData {
  email: string;
  name: string;
  phone: string;
}

export function useProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['profile', user?.email],
    queryFn: async (): Promise<ProfileData> => {
      if (!user?.email) throw new Error('No user email');
      const response = await fetch(`/api/user/profile?email=${encodeURIComponent(user.email)}`);
      if (!response.ok) throw new Error('Failed to fetch profile');
      return response.json();
    },
    enabled: !!user?.email,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { name: string; phone: string }): Promise<ProfileData> => {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user?.email,
          name: data.name.trim(),
          phone: data.phone.trim(),
        }),
      });
      if (!response.ok) throw new Error('Failed to update profile');
      
      // Return the updated data
      return {
        email: user?.email || '',
        name: data.name.trim(),
        phone: data.phone.trim(),
      };
    },
    onSuccess: (updatedData) => {
      // Update the cache with new data
      queryClient.setQueryData(['profile', user?.email], updatedData);
      // Also invalidate to refetch
      queryClient.invalidateQueries({ queryKey: ['profile', user?.email] });
      toast.success('✅ Profile updated successfully!');
    },
    onError: (error) => {
      toast.error('❌ Failed to update profile. Please try again.');
      console.error('Profile update error:', error);
    },
  });

  return {
    profile,
    isLoading,
    error,
    updateProfile: updateProfileMutation.mutate,
    isUpdating: updateProfileMutation.isPending,
  };
}