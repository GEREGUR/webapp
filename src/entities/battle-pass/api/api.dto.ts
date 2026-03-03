export type BattlePassRewardType = 'STARS' | 'PREMIUM' | 'GIFT' | 'TON' | 'BP';

export interface BattlePassReward {
  id: number;
  level: number;
  type: BattlePassRewardType;
  count: number;
  title: string;
  is_claimed: boolean;
  is_available: boolean;
  type_reward: string;
}

export interface BattlePassResponse {
  level: number;
  exp: number;
  progress: number;
  rewards: BattlePassReward[];
  is_active: boolean;
}

export interface BattlePassError {
  detail: string;
}
