import type { UserProfile } from './api.dto';

export const MOCK_PROFILE: UserProfile = {
  id: 1,
  name: 'Alex Johnson',
  username: 'alex_j',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  internal_balance: 5000,
  ton_balance: 2.5,
  wallet_address: 'EQABC123...XYZ789',
  referral_earn: 1250,
};
