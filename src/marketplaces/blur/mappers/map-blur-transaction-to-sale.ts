import { Block } from 'src/models/block';
import { Transaction } from 'src/models/transaction';
import { OrdersMatchedLog } from '../models/orders-matched';
import { Sale } from 'src/models/sale';
import { Marketplace } from 'src/models/marketplace';

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
  };
}
