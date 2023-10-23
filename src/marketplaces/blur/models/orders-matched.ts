export interface OrdersMatchedLog {
  maker: string;
  taker: string;
  sell: Order;
  sellHash: string;
  buy: Order;
  buyHash: string;
}

export enum Side {
  BUY,
  SELL,
}

export interface Order {
  trader: string;
  side: Side;
  matchingPolicy: string;
  collection: string;
  tokenId: number;
  amount: number;
  paymentToken: string;
  price: number;
  listingTime: number;
  expirationTime: number;
  fees: Fee[];
  salt: number;
  extraParams: string;
}

export interface Fee {
  rate: number;
  recipient: string;
}
