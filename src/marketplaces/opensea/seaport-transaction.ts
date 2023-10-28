import { Transaction } from 'src/models/transaction';
import { seaportInterface } from '.';
import { Interface, parseEther } from 'ethers';
import {
  SeaportAbiMethodNames,
  ORDER_FULFILLED_KECCAK_HASH,
  ORDERS_MATCHED_KECCAK_HASH,
} from './seaport-abi';
import { Log } from 'src/models/log';
import { OrderFulfilledLog } from './models/order-fulfilled';
import { mapOrderFulfilledLog } from './mappers/map-order-fulfilled-log';
import { Block } from 'src/models/block';
import { OrdersMatchedLog } from './models/orders-matched';
import { mapOrdersMatchedLog } from './mappers/map-orders-matched-log';
import { mapSeaportTransactionToSale } from './mappers/map-seaport-transaction-to-sale';

export class SeaportTransaction {
  block: Block;
  seaportInterface: Interface;

  constructor(block: Block) {
    this.seaportInterface = seaportInterface;
    this.block = block;
  }

  /**
   * Given a valid transaction executed using the appropriate ABI method, it will return a list of sales that occurred during this transaction.
   * @param transaction A ETH blockchain transaction
   * @returns A list of sales that occurred during the transaction
   */
  ingestTransaction(transaction: Transaction) {
    const parsedTransaction = seaportInterface.parseTransaction({
      data: transaction.inputData,
      value: parseEther('1.0'),
    });

    // These ABI methods are used to process a sale based on Seaport's protocol. If any transaction executed one of these ABI methods, we should convert it into a sale
    switch (parsedTransaction?.name as SeaportAbiMethodNames) {
      case 'fulfillAdvancedOrder':
      case 'fulfillAvailableAdvancedOrders':
      case 'fulfillAvailableOrders':
      case 'fulfillBasicOrder':
      case 'fulfillBasicOrder_efficient_6GL6yc':
      case 'fulfillOrder':
      case 'matchOrders':
      case 'matchAdvancedOrders': {
        const { orderFulfilledLogs, ordersMatchedLog } =
          this.parseTransactionLogs(transaction.logs, transaction.hash);

        return mapSeaportTransactionToSale(
          this.block,
          transaction,
          orderFulfilledLogs,
          ordersMatchedLog
        );
      }
      default:
        return [];
    }
  }

  /**
   * Parses transactions logs into a more readable format using ethers. OrderFulfilled and OrdersMatched logs are the only logs parsed. Any other logs we do not need.
   * @param logs The logs of a transaction to parse
   * @param transactionHash Hash of the transaction, used for error handling
   * @returns Object that contains the OrderFulfilled logs and OrdersMatched log if it is available
   */
  parseTransactionLogs(
    logs: Log[],
    transactionHash: string
  ): {
    orderFulfilledLogs: OrderFulfilledLog[];
    ordersMatchedLog: OrdersMatchedLog | undefined;
  } {
    const orderFulfilledLogs = [];
    let isOrdersMatchedKeccakAvailable = false;
    let ordersMatchedLog = undefined;

    for (const log of logs) {
      if (log.topics[0] === ORDER_FULFILLED_KECCAK_HASH) {
        const parsedLog = seaportInterface.parseLog({
          topics: log.topics,
          data: log.data,
        });

        if (parsedLog) {
          orderFulfilledLogs.push(mapOrderFulfilledLog(parsedLog));
        }
      } else if (log.topics[0] === ORDERS_MATCHED_KECCAK_HASH) {
        isOrdersMatchedKeccakAvailable = true;
        const parsedLog = seaportInterface.parseLog({
          topics: log.topics,
          data: log.data,
        });

        if (parsedLog) {
          ordersMatchedLog = mapOrdersMatchedLog(parsedLog);
        }
      }
    }

    // When keccak hash for OrdersMatched log was found, we need to ensure that an OrdersMatched log was parsed properly
    if (isOrdersMatchedKeccakAvailable) {
      if (ordersMatchedLog) {
        return {
          orderFulfilledLogs,
          ordersMatchedLog,
        };
      } else {
        throw new Error(
          `No OrdersMatched log was found in the transaction: ${transactionHash}`
        );
      }
    }

    return {
      orderFulfilledLogs,
      ordersMatchedLog,
    };
  }
}
