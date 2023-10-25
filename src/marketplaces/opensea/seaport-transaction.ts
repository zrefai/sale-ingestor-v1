import { Transaction } from 'src/models/transaction';
import { seaportInterface } from '.';
import { Interface, parseEther } from 'ethers';
import {
  SeaportAbiMethodNames,
  ORDER_FULFILLED_KECCAK_HASH,
  ORDERS_MATCHED_KECCAK_HASH,
  SeaportAbiEvents,
} from './seaport-abi';
import { Log } from 'src/models/log';
import { OrderFulfilledLog } from './models/order-fulfilled';
import { mapOrderFulfilledLog } from './mappers/map-order-fulfilled-log';
import { Block } from 'src/models/block';
import { OrdersMatchedLog } from './models/orders-matched';
import { mapOrdersMatchedLog } from './mappers/map-orders-matched-log';
import { mapSeaportTransactionToSale } from './mappers/map-seaport-transaction-to-sale';
import util from 'util';

export class SeaportTransaction {
  block: Block;
  seaportInterface: Interface;

  constructor(block: Block) {
    this.seaportInterface = seaportInterface;
    this.block = block;
  }

  ingestTransaction(transaction: Transaction) {
    const parsedTransaction = seaportInterface.parseTransaction({
      data: transaction.inputData,
      value: parseEther('1.0'),
    });

    console.log(parsedTransaction?.name);
    switch (parsedTransaction?.name as SeaportAbiMethodNames) {
      case 'fulfillAdvancedOrder':
      case 'fulfillAvailableAdvancedOrders':
      case 'fulfillAvailableOrders':
      case 'fulfillBasicOrder':
      case 'fulfillBasicOrder_efficient_6GL6yc':
      case 'fulfillOrder': {
        const logs = this.ingestTransactionLogs(transaction.logs);
        console.log(util.inspect(logs, false, null, true));

        // TODO: Maybe get the NFT address that is being interacted with here and cross check against the dictionary of addresses we want to log sales for
        // return mapSeaportTransactionToSale(this.block, transaction, logs);
        return mapSeaportTransactionToSale(this.block, transaction, logs);
      }
      case 'matchOrders':
      case 'matchAdvancedOrders': {
        const { orderFulfilledLogs, orderMatchedLog } =
          this.ingestTransactionMatchedLogs(transaction.logs, transaction.hash);
        console.log(util.inspect(orderFulfilledLogs, false, null, true));
        console.log(util.inspect(orderMatchedLog, false, null, true));

        // console.log(util.inspect(orderFulfilledLogs, false, null, true));

        return mapSeaportTransactionToSale(
          this.block,
          transaction,
          orderFulfilledLogs,
          orderMatchedLog
        );
      }
      default:
        return [];
    }
  }

  ingestTransactionLogs(logs: Log[]): OrderFulfilledLog[] {
    const orderFulfilledLogs: OrderFulfilledLog[] = [];

    for (const log of logs) {
      if (log.topics[0] === ORDER_FULFILLED_KECCAK_HASH) {
        const parsedLog = seaportInterface.parseLog({
          topics: log.topics,
          data: log.data,
        });

        if (parsedLog) orderFulfilledLogs.push(mapOrderFulfilledLog(parsedLog));
      }
    }

    return orderFulfilledLogs;
  }

  // Transaction with group buy and using matchAdvancedOrders https://etherscan.io/tx/0x8e4612be02d283d57a279e7e4e6bd9ee1ccd910ff154fe9a8700e94b1378477d#eventlog
  ingestTransactionMatchedLogs(
    logs: Log[],
    transactionHash: string
  ): {
    orderFulfilledLogs: OrderFulfilledLog[];
    orderMatchedLog: OrdersMatchedLog;
  } {
    const orderFulfilledLogs = [];
    let orderMatchedLog = undefined;

    for (const log of logs) {
      if (
        log.topics[0] === ORDER_FULFILLED_KECCAK_HASH ||
        log.topics[0] === ORDERS_MATCHED_KECCAK_HASH
      ) {
        const parsedLog = seaportInterface.parseLog({
          topics: log.topics,
          data: log.data,
        });

        if (
          parsedLog &&
          (parsedLog.name as SeaportAbiEvents) === 'OrderFulfilled'
        ) {
          orderFulfilledLogs.push(mapOrderFulfilledLog(parsedLog));
        } else if (
          parsedLog &&
          (parsedLog.name as SeaportAbiEvents) === 'OrdersMatched'
        ) {
          orderMatchedLog = mapOrdersMatchedLog(parsedLog);
        }
      }
    }

    if (orderMatchedLog) {
      return {
        orderFulfilledLogs,
        orderMatchedLog,
      };
    } else {
      throw new Error(
        `No OrdersMatched log was found in the transaction: ${transactionHash}`
      );
    }
  }
}
