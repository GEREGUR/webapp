// Battle Pass entity API types
export interface BattlePassReward {
  id: number;
  level: number;
  reward_ton: number;
  reward_bp: number;
  reward_exp: number;
  is_available: boolean;
  is_claimed: boolean;
}

export interface BattlePassState {
  level: number;
  exp: number;
  progress: number; // 0-100
  rewards: BattlePassReward[];
}
