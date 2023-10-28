import { Sale } from 'src/models/sale';
import { OrderFulfilledLog } from '../models/order-fulfilled';
import { Transaction } from 'src/models/transaction';
import { Marketplace } from 'src/models/marketplace';
import { Block } from 'src/models/block';
import { OrdersMatchedLog } from '../models/orders-matched';

const OPENSEA_FEE_COLLECTOR = '0x0000a26b00c1F0DF003000390027140000fAa719';

/**
 * Converts the OrderFulfilled logs and OrdersMatched log into Sales. If a list of OrderFulfilled logs is only provided, it will map over each OrderFulfilled log and convert it into a Sale. If both a list of OrderFulfilled logs and an OrdersMatched log is provided, it will use the OrdersMatched log to determine what OrderFulfilled logs are converted into a Sale.
 * @param block The block the transaction occurred in.
 * @param transaction The transaction the OrderFulfilled log occurred in.
 * @param orderFulfilledLogs The list of OrderFulfilled logs from a transaction.
 * @param ordersMatchedLog The OrdersMatched log from the transaction if it is available
 * @returns A list of Sales that occurred during a transaction
 */
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

/**
 * Maps information from the block, transaction, and OrderFulfilled log to a Sale. Uses mapOfferAndConsiderationItemsToSale to fill in properties that are equivalent to the offer and consideration items from an OrderFulfilled log.
 * @param block The block the transaction occurred in.
 * @param transaction The transaction the OrderFulfilled log occurred in.
 * @param orderFulfilledLog The log containing information about the sale.
 * @returns A Sale
 */
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
    buyerAddress: orderFulfilledLog.recipient,
    sellerAddress: orderFulfilledLog.offerer,
    blockNumber: block.number,
    blockTimestamp: block.timestamp,
    ...considerationItems,
  } as Sale;
}

/**
 * Maps offer and consideration items to a sale. If the offer item is the NFT and the first consideration item is ETH (i.e. the ETH being spent on the NFT) then the recipient initiated the transaction; meaning that they purchased a listed NFT. If the offer item is ETH and the first consideration item is the NFT, then the offerer initiated the transaction; meaning they accepted an offer on the NFT. Only these properties are mapped from an OrderFulfilled log to a Sale: the contractAddress, tokenId, sellerFee, protocolFee, and royaltyFee.
 * @param orderFulfilledLog The OrderFulfilled log to map.
 * @returns A partial Sale, where only the contractAddress, tokenId, sellerFee, protocolFee, and royaltyFee are mapped.
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
