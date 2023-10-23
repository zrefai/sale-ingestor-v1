export interface TakerBidLog {
  nonceInvalidationParameters: NonceInvalidationParameters;
  bidUser: string;
  bidRecipient: string;
  strategy: number;
  currency: number;
  collection: string;
  itemIds: string[];
  amounts: string[];
  feeRecipients: FeeRecipients;
  feeAmounts: FeeAmounts;
}

interface NonceInvalidationParameters {
  orderHash: string;
  orderNonce: number;
  isNonceInvalidated: boolean;
}

interface FeeRecipients {
  feeRecipient: string;
  creatorFeeRecipient: string;
}

interface FeeAmounts {
  amount: number;
  creatorFeeAmount: number;
  protocolFeeAmount: number;
}
