/** Phase 3: Wallet Types */

export type WalletTransactionType = 'recharge' | 'debit' | 'refund';

export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface WalletTransaction {
  id: string;
  walletId: string;
  type: WalletTransactionType;
  amount: number;
  description: string;
  referenceId: string | null;
  createdAt: Date;
}

export interface RechargeInput {
  amount: number;
}

/** Quick recharge amounts in paise */
export const WALLET_RECHARGE_OPTIONS = [
  { amount: 10000, displayAmount: 100, label: '100' },
  { amount: 20000, displayAmount: 200, label: '200' },
  { amount: 50000, displayAmount: 500, label: '500' },
] as const;
