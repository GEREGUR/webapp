// Wallet entity API types
export interface PaymentData {
  address: string;
  memo: string;
}

export interface WithdrawalRequest {
  address: string;
  amount: number;
}

export interface PaymentSuccessEvent {
  amount: number;
  tx_hash: string;
}

export interface WithdrawalSuccessEvent {
  amount: number;
}
