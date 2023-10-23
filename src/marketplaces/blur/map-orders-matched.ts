import { LogDescription, Result, formatEther } from 'ethers';
import { Fee, Order, OrdersMatchedLog, Side } from './models/orders-matched';

export function mapOrdersMatched(parsedLog: LogDescription): OrdersMatchedLog {
  const args = parsedLog.args.toObject();
  return {
    maker: args.maker,
    taker: args.taker,
    sell: mapOrdersMatchedOrder(args.sell.toObject()),
    sellHash: args.sellHash,
    buy: mapOrdersMatchedOrder(args.buy.toObject()),
    buyHash: args.buyHash,
  };
}

function mapOrdersMatchedOrder(order: Record<string, any>): Order {
  return {
    trader: order.trader,
    side: Number(order.side) as Side,
    matchingPolicy: order.matchingPolicy,
    collection: order.collection,
    tokenId: Number(order.tokenId),
    amount: Number(order.amount),
    paymentToken: order.paymentToken,
    price: Number(formatEther(order.price)),
    listingTime: Number(order.listingTime),
    expirationTime: Number(order.expirationTime),
    fees: order.fees
      .toArray()
      .map((fee: Result) => mapOrdersMatchedFee(fee.toObject())),
    salt: Number(order.salt),
    extraParams: order.extraParams,
  };
}

function mapOrdersMatchedFee(fee: Record<string, any>): Fee {
  return {
    rate: Number(fee.rate),
    recipient: fee.recipient,
  };
}
