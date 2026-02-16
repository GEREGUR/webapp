// User entity API types
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

export interface Transaction {
  id: number;
  type: 'CREATE_ORDER' | 'BUY_ORDER' | 'REFERRAL' | 'PAYMENT' | 'WITHDRAWAL' | 'BATTLE_PASS';
  currency: 'BP' | 'TON';
  value: number;
  obj_id: number | null;
  date: string;
}

export interface WalletHistoryResponse {
  items: Transaction[];
  offset: number;
  limit: number;
  total: number;
}

export interface BindWalletRequest {
  address: string;
}
