import { useQuery } from '@tanstack/react-query';
import { api, getRequiredUserId, getTelegramUserData } from '@/shared/api';
import type { UserProfile } from './api.dto';
import { MOCK_PROFILE } from './mock';

interface GetMeResponse {
  id: number;
  internal_balance: number;
  ton_balance: number;
  wallet_address: string | null;
  referral_earn: number;
}

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
      try {
        const response = await api.get<GetMeResponse>('/user/me', {
          params: {
            user_id: getRequiredUserId(),
          },
        });
        const telegramUser = getTelegramUserData();

        return {
          ...response.data,
          name: telegramUser?.first_name || `User #${response.data.id}`,
          username: telegramUser?.username || `user${response.data.id}`,
          avatar: telegramUser?.photo_url || '',
        };
      } catch (error) {
        console.error('API Error useProfile:', error);
        throw error;
      }
    },
  });
};
