import { ingestBlurMarketplaceTransaction } from './marketplaces/blur/ingest-blur-marketplace-transaction';
import { ingestSeaportTransaction } from './marketplaces/opensea/ingest-seaport-transaction';
import { Block } from './models/block';
import { Marketplace } from './models/marketplace';
import { Sale } from './models/sale';

export function ingestTransactions(block: Block) {
  const transactions = block.transactions;

  const sales: Sale[] = [];

  for (const transaction of transactions) {
    // When transaction status is 0, that means the transaction was cancelled on the blockchain
    if (transaction && transaction.status === 1) {
      switch (transaction.to.address as Marketplace) {
        case Marketplace.SEAPORT: {
          sales.push(...ingestSeaportTransaction(block, transaction));
          return;
        }
        case Marketplace.BLUR_MARKETPLACE: {
          ingestBlurMarketplaceTransaction(block, transaction);
          return [];
        }
        case Marketplace.BLUR_MARKETPLACE_2:
          return [];
        case Marketplace.BLUR_MARKETPLACE_3:
          return [];
        default:
          return [];
      }
    }
  }

  return sales;
}
