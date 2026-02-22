import { useQuery } from '@tanstack/react-query';
import { api, getRequiredUserId } from '@/shared/api';
import type {
  BattlePassResponse,
  BattlePassReward,
  InventoryResponse,
  InventoryItem,
} from './api.dto';

const QUERY_KEYS = {
  inventory: ['inventory'] as const,
};

export const useInventory = () => {
  return useQuery({
    queryKey: QUERY_KEYS.inventory,
    queryFn: async (): Promise<InventoryResponse> => {
      try {
        const response = await api.get<BattlePassResponse>('/battle/me', {
          params: {
            user_id: getRequiredUserId(),
          },
        });

        const items = response.data.rewards.map(mapRewardToInventoryItem);
        return {
          items,
          total: items.length,
        };
      } catch (error) {
        console.error('API Error useInventory:', error);
        throw error;
      }
    },
  });
};

const mapRewardToInventoryItem = (reward: BattlePassReward): InventoryItem => {
  return {
    id: reward.id,
    name: reward.title,
    description: `Награда за уровень ${reward.level}`,
    image: '',
    rarity: mapRewardRarity(reward.type),
    quantity: reward.count,
    type: mapInventoryType(reward.type),
  };
};

const mapRewardRarity = (type: BattlePassReward['type']): InventoryItem['rarity'] => {
  if (type === 'STARS') return 'legendary';
  if (type === 'PREMIUM') return 'epic';
  if (type === 'GIFT') return 'rare';
  if (type === 'TON') return 'uncommon';
  return 'common';
};

const mapInventoryType = (type: BattlePassReward['type']): InventoryItem['type'] => {
  if (type === 'GIFT') return 'badge';
  if (type === 'PREMIUM') return 'effect';
  if (type === 'STARS') return 'skin';
  return 'avatar';
};
