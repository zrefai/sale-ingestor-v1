import { Marketplace } from './marketplace';

export interface Sale {
  transactionHash: string;
  marketplace: Marketplace;
  contractAddress: string;
  tokenId: number;
  buyerAddress: string;
  sellerAddress: string;
  sellerFee: Fee;
  protocolFee?: Fee;
  royaltyFee?: Fee;
  blockNumber: number;
  blockTimestamp: number;
  clusterId?: string;
}

export interface Fee {
  amount: number;
  tokenAddress: string;
}
