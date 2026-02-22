import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/api';
import type { UserProfile } from './api.dto';

const QUERY_KEYS = {
  profile: ['user', 'profile'] as const,
};

export const useProfile = () => {
  return useQuery({
    queryKey: QUERY_KEYS.profile,
    queryFn: async (): Promise<UserProfile> => {
      const response = await api.get<UserProfile>('/user/me');
      return response.data;
    },
  });
};

