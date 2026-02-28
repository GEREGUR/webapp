export interface PaymentData {
  address: string;
  memo: string;
  min_ton_amount: number;
}

export interface CheckPaymentResponse {
  status: string;
  message: string;
}

export interface CheckPaymentRequest {
  memo: string;
}

export interface WithdrawRequest {
  amount: number;
  address: string;
}

export interface WalletActionResponse {
  status: string;
  message: string;
}
