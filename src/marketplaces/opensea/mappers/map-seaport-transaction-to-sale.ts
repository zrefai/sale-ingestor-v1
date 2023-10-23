import { Fee, Sale } from 'src/models/sale';
import { OrderFulfilledLog } from '../models/order-fulfilled';
import { Transaction } from 'src/models/transaction';
import { Marketplace } from 'src/models/marketplace';
import { Block } from 'src/models/block';
import { OrdersMatchedLog } from '../models/orders-matched';

const OPENSEA_FEE_COLLECTOR = '0x0000a26b00c1F0DF003000390027140000fAa719';

export function mapSeaportTransactionToSale(
  block: Block,
  transaction: Transaction,
  orderFulfilledLogs: OrderFulfilledLog[],
  ordersMatchedLog?: OrdersMatchedLog
): Sale[] {
  if (ordersMatchedLog) {
    if (ordersMatchedLog.orderHashes.length % 2 === 0) {
      const sales: Sale[] = [];

      for (let i = 0; i < ordersMatchedLog.orderHashes.length; i += 2) {
        const orderFulfilledLog = orderFulfilledLogs[i];

        sales.push(
          mapOrderFulfilledToSale(
            orderFulfilledLog,
            transaction.hash,
            block.timestamp,
            block.number
          )
        );
      }

      return sales;
    } else {
      throw new Error(
        `OrdersMatched log has an odd amount of order hashes from transaction: ${transaction.hash}`
      );
    }
  }

  return orderFulfilledLogs.map((log) =>
    mapOrderFulfilledToSale(
      log,
      transaction.hash,
      block.timestamp,
      block.number
    )
  );
}

function mapOrderFulfilledToSale(
  orderFulfilledLog: OrderFulfilledLog,
  transactionHash: string,
  blockTimestamp: number,
  blockNumber: number
): Sale {
  const offerItem = orderFulfilledLog.offer[0];
  const considerationItems = mapConsiderationItemsToSale(orderFulfilledLog);

  // TODO: protocol and royalty fee need to be flipped MAYBE
  // TODO: offerItem contains the sellerFee
  // TODO: first consideration item is the token and contract address

  return {
    transactionHash: transactionHash,
    marketplace: Marketplace.SEAPORT,
    buyerAddress: orderFulfilledLog.offerer,
    sellerAddress: orderFulfilledLog.recipient,
    sellerFee: {
      amount: offerItem.amount,
      tokenAddress: offerItem.token,
    },
    blockNumber,
    blockTimestamp,
    ...considerationItems,
  } as Sale;
}

function mapConsiderationItemsToSale(
  orderFulfilledLog: OrderFulfilledLog
): Partial<Sale> {
  const partialSale: Partial<Sale> = {};

  for (const considerationItem of orderFulfilledLog.consideration) {
    if (considerationItem.recipient === orderFulfilledLog.offerer) {
      partialSale.contractAddress = considerationItem.token;
      partialSale.tokenId = considerationItem.identifier;
    } else if (considerationItem.recipient === OPENSEA_FEE_COLLECTOR) {
      partialSale.protocolFee = {
        amount: considerationItem.amount,
        tokenAddress: considerationItem.token,
      };
    } else {
      partialSale.royaltyFee = {
        amount: considerationItem.amount,
        tokenAddress: considerationItem.token,
      };
    }
  }
  return partialSale;
}
