export interface EvInventoryLog {
  itemHash: string;
  maker: string;
  taker: string;
  orderSalt: number;
  settleSalt: number;
  intent: number;
  delegateType: DelegateType;
  deadline: number;
  currency: string;
  dataMask: string;
  item: Item;
  detail: Detail;
}

export enum DelegateType {
  INVALID,
  ERC721,
  ERC1155,
}

export interface Item {
  price: number;
  data: ItemData;
}

export interface ItemData {
  contractAddress: string;
  itemId: number;
}

export interface Detail {
  op: number;
  orderIdx: number;
  itemIdx: number;
  price: number;
  itemHash: string;
  executionDelegate: string;
  dataReplacement: string;
  bidIncentivePct: number;
  aucMinIncrementPct: number;
  aucIncDurationSecs: number;
  fees: Fee[];
}

export interface Fee {
  percentage: number;
  to: string;
}
