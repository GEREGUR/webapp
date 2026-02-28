export interface UserProfile {
  id: number;
  internal_balance: number;
  ton_balance: number;
  wallet_address: string | null;
  referral_earn: number;
  is_checked_instruction: boolean;
  name: string;
  username: string;
  avatar: string;
}
