export interface UserProfile {
  id: number;
  name: string;
  username: string;
  avatar: string;
  internal_balance: number;
  ton_balance: number;
  wallet_address: string | null;
  referral_earn: number;
}
