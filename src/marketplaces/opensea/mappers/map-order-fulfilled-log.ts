import { LogDescription, Result, formatEther } from 'ethers';
import {
  OrderFulfilledLog,
  ConsiderationItem,
  ItemType,
  OfferItem,
} from '../models/order-fulfilled';

export function mapOrderFulfilledLog(
  parsedLog: LogDescription
): OrderFulfilledLog {
  const args = parsedLog.args.toObject();
  return {
    orderHash: args.orderHash,
    offerer: args.offerer,
    zone: args.zone,
    recipient: args.recipient,
    offer: args.offer
      .toArray()
      .map((offer: Result) => mapOrderFulfilledOffer(offer.toObject())),
    consideration: args.consideration
      .toArray()
      .map((considerationItem: Result) => {
        const considerationItemObject = considerationItem.toObject();
        return {
          ...mapOrderFulfilledOffer(considerationItemObject),
          recipient: considerationItemObject.recipient,
        } as ConsiderationItem;
      }),
  };
}

function mapOrderFulfilledOffer(offer: Record<string, any>) {
  const itemType = Number(offer.itemType) as ItemType;
  return {
    itemType,
    token: offer.token,
    identifier: Number(offer.identifier),
    amount:
      itemType < 2 ? Number(formatEther(offer.amount)) : Number(offer.amount),
  } as OfferItem;
}
