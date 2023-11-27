import { Block } from 'src/models/block';
import { Transaction } from 'src/models/transaction';
import { blurMarketplaceInterface } from './ABIs/abi-interfaces';
import { parseEther } from 'ethers';
import {
  BlurExchangeABIMethodNames,
  ORDERS_MATCHED_KECCAK_HASH,
} from './ABIs/blur-abi';
import { Log } from 'src/models/log';
import { mapOrdersMatchedLog } from './mappers/map-orders-matched-log';
import { OrdersMatchedLog } from './models/orders-matched';
import { mapBlurTransactionToSale } from './mappers/map-blur-transaction-to-sale';

/**
 * Given a valid transaction executed using the appropriote ABI methods, it will return a list of sales that occurred during the transaction.
 * @param block The block the transaction occurred in
 * @param transaction A ETH blockchain transaction
 * @returns A list of sales that occurred during the transaction
 */
export function ingestBlurMarketplaceTransaction(
  block: Block,
  transaction: Transaction
) {
  const parsedTransaction = blurMarketplaceInterface.parseTransaction({
    data: transaction.inputData,
    value: parseEther('1.0'),
  });

  switch (parsedTransaction?.name as BlurExchangeABIMethodNames) {
    case 'execute': {
      const ordersMatchedLogs = parseTransactionLogs(transaction.logs);
      return mapBlurTransactionToSale(block, transaction, ordersMatchedLogs);
    }
    default:
      return [];
  }
}

/**
 * Parses transactions logs into a more readable format using ethers. Only OrdersMatched logs are parsed.
 * @param logs The logs of a transaction to parse.
 * @returns A list of OrdersMatched logs.
 */
function parseTransactionLogs(logs: Log[]) {
  const ordersMatchedLogs: OrdersMatchedLog[] = [];
  for (const log of logs) {
    if (log.topics[0] === ORDERS_MATCHED_KECCAK_HASH) {
      const parsedLog = blurMarketplaceInterface.parseLog({
        topics: log.topics,
        data: log.data,
      });

      if (parsedLog) {
        ordersMatchedLogs.push(mapOrdersMatchedLog(parsedLog));
      }
    }
  }

  return ordersMatchedLogs;
}
