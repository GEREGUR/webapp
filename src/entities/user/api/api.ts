import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/api';
import type { UserProfile } from './api.dto';
import { MOCK_PROFILE } from './mock';

const QUERY_KEYS = {
  profile: ['user', 'profile'] as const,
};

export const useProfile = () => {
  return useQuery({
    queryKey: QUERY_KEYS.profile,
    queryFn: async (): Promise<UserProfile> => {
      if (import.meta.env.DEV) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return MOCK_PROFILE;
      }
      const response = await api.get<UserProfile>('/user/me');
      return response.data;
    },
  });
};
