import { Sale } from 'src/models/sale';
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
          mapOrderFulfilledToSale(block, transaction, orderFulfilledLog)
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
    mapOrderFulfilledToSale(block, transaction, log)
  );
}

function mapOrderFulfilledToSale(
  block: Block,
  transaction: Transaction,
  orderFulfilledLog: OrderFulfilledLog
): Sale {
  const considerationItems =
    mapOfferAndConsiderationItemsToSale(orderFulfilledLog);

  return {
    transactionHash: transaction.hash,
    marketplace: Marketplace.SEAPORT,
    buyerAddress: orderFulfilledLog.offerer,
    sellerAddress: orderFulfilledLog.recipient,
    blockNumber: block.number,
    blockTimestamp: block.timestamp,
    ...considerationItems,
  } as Sale;
}
/**
 * If recipient initiated the transaction, then:
 * - offer is the NFT
 * - First consideration item is the ETH being spent
 *
 * If offerer initiated the transaction, then:
 * - offer is the ETH being spent
 * - First consideration item is the NFT
 * @param orderFulfilledLog
 * @returns
 */

function mapOfferAndConsiderationItemsToSale(
  orderFulfilledLog: OrderFulfilledLog
): Partial<Sale> {
  const offerItem = orderFulfilledLog.offer[0];
  // TODO: This is probably not the best way to determine who (offerer or recipient) finished the transaction, change it.
  const isOfferItemAnNFT = offerItem.itemType > 1;
  const partialSale: Partial<Sale> = {};

  for (const considerationItem of orderFulfilledLog.consideration) {
    if (considerationItem.recipient === orderFulfilledLog.offerer) {
      if (isOfferItemAnNFT) {
        partialSale.contractAddress = offerItem.token;
        partialSale.tokenId = offerItem.identifier;
        partialSale.sellerFee = {
          amount: considerationItem.amount,
          tokenAddress: considerationItem.token,
        };
      } else {
        partialSale.contractAddress = considerationItem.token;
        partialSale.tokenId = considerationItem.identifier;
        partialSale.sellerFee = {
          amount: offerItem.amount,
          tokenAddress: offerItem.token,
        };
      }
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
