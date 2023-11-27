import { Block } from 'src/models/block';
import { Transaction } from 'src/models/transaction';
import { OrdersMatchedLog } from '../models/orders-matched';
import { Sale } from 'src/models/sale';
import { Marketplace } from 'src/models/marketplace';

/**
 * Converts the OrdersMatched logs into Sales.
 * @param block The block the transaction occurred in.
 * @param transaction The transaction the OrdersMatched logs occurred in.
 * @param ordersMatchedLogs The list of OrdersMatched logs from a transaction.
 * @returns A list of Sales.
 */
export function mapBlurTransactionToSale(
  block: Block,
  transaction: Transaction,
  ordersMatchedLogs: OrdersMatchedLog[]
) {
  return ordersMatchedLogs.map((ordersMatchedLog) =>
    mapOrdersMatchedToSale(block, transaction, ordersMatchedLog)
  );
}

function mapOrdersMatchedToSale(
  block: Block,
  transaction: Transaction,
  ordersMatchedLog: OrdersMatchedLog
): Sale {
  return {
    transactionHash: transaction.hash,
    marketplace: Marketplace.BLUR_MARKETPLACE,
    blockNumber: block.number,
    blockTimestamp: block.timestamp,
    contractAddress: ordersMatchedLog.sell.collection,
    tokenId: ordersMatchedLog.sell.tokenId,
    buyerAddress: ordersMatchedLog.buy.trader,
    sellerAddress: ordersMatchedLog.sell.trader,
    sellerFee: {
      amount: ordersMatchedLog.buy.price,
      tokenAddress: ordersMatchedLog.buy.paymentToken,
    },
    // Protocol fees are not mapped because BLUR doesn't take fees.
  };
}
