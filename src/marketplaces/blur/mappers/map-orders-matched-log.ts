import { LogDescription, Result, formatEther } from 'ethers';
import { Fee, Order, OrdersMatchedLog, Side } from '../models/orders-matched';

export function mapOrdersMatchedLog(
  parsedLog: LogDescription
): OrdersMatchedLog {
  const args = parsedLog.args.toObject();
  return {
    maker: args.maker,
    taker: args.taker,
    sell: mapOrder(args.sell),
    sellHash: args.sellHash,
    buy: mapOrder(args.buy),
    buyHash: args.buyHash,
  };
}

function mapOrder(order: Record<string, any>): Order {
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
    fees: order.fees.toArray().map((fee: Result) => {
      return {
        rate: Number(fee.rate),
        recipient: fee.recipient,
      } as Fee;
    }),
    salt: order.salt.toString(),
    extraParams: order.extraParams,
  };
}
