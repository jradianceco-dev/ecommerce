/**
 * Flutterwave Payment Type Definitions
 */
export interface FlutterwaveTransactionData {
  id: number;
  tx_ref: string;
  flutterwave_ref: string;
  amount: number;
  currency: string;
  status: 'successful' | 'failed' | 'pending';
  customer: { email: string; name?: string };
  meta: { order_id: string; order_number: string };
}

export interface PaymentVerificationResult {
  success: boolean;
  message: string;
  transaction?: FlutterwaveTransactionData;
  orderUpdated?: boolean;
}

export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
}