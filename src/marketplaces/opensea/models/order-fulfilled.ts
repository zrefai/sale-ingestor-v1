export enum ItemType {
  // 0: ETH on mainnet, MATIC on polygon, etc.
  NATIVE,
  // 1: ERC20 items (ERC777 and ERC20 analogues could also technically work)
  ERC20,
  // 2: ERC721 items
  ERC721,
  // 3: ERC1155 items
  ERC1155,
  // 4: ERC721 items where a number of tokenIds are supported
  ERC721_WITH_CRITERIA,
  // 5: ERC1155 items where a number of ids are supported
  ERC1155_WITH_CRITERIA,
}

export interface OrderFulfilledLog {
  // Unique EIP712 hash that identifies the order
  orderHash: string;
  // Address of the entity that is offering the order
  offerer: string;
  // Also known as an account that can cancel the order or restrict who can fulfill the order depending on the type
  zone: string;
  // Address of the entity that is fulfilling the order
  recipient: string;
  offer: OfferItem[];
  consideration: ConsiderationItem[];
}

export interface OfferItem {
  itemType: ItemType;
  // Address of the token
  token: string;
  // Identifier is also known as "identifierOrCriteria" that either represents a tokenId or a merkle root depending on the item type
  identifier: number;
  amount: number;
}

export interface ConsiderationItem extends OfferItem {
  recipient: string;
}
