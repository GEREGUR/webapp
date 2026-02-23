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
