export interface InventoryItem {
  id: number;
  name: string;
  description: string;
  image: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  quantity: number;
  type: 'avatar' | 'badge' | 'skin' | 'effect';
}

export interface InventoryResponse {
  items: InventoryItem[];
  total: number;
}

export type BattlePassRewardType = 'STARS' | 'PREMIUM' | 'GIFT' | 'TON' | 'BP';

export interface BattlePassReward {
  id: number;
  level: number;
  type: BattlePassRewardType;
  count: number;
  title: string;
  is_claimed: boolean;
  is_available: boolean;
}

export interface BattlePassResponse {
  level: number;
  exp: number;
  progress: number;
  rewards: BattlePassReward[];
}
