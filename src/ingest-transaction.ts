import { ingestBlurMarketplaceTransaction } from './marketplaces/blur/ingestors/ingest-blur-marketplace-transaction';
import { ingestLooksRareTransaction } from './marketplaces/looks-rare/ingest-looks-rare-transaction';
import { ingestSeaportTransaction } from './marketplaces/opensea/ingest-seaport-transaction';
import { Block } from './models/block';
import { Marketplace } from './models/marketplace';
import { Sale } from './models/sale';
import { Transaction } from './models/transaction';

export function ingestTransactions(block: Block): Sale[] {
  const transactions = block.transactions;

  const sales: Sale[] = [];

  for (const transaction of transactions) {
    // When transaction status is 0, that means the transaction was cancelled on the blockchain
    if (transaction && transaction.status === 1) {
      sales.push(...ingestTransactionsForMarketplace(block, transaction));
    }
  }

  return sales;
}

function ingestTransactionsForMarketplace(
  block: Block,
  transaction: Transaction
): Sale[] {
  switch (transaction.to.address as Marketplace) {
    case Marketplace.SEAPORT:
      return ingestSeaportTransaction(block, transaction);
    case Marketplace.BLUR_MARKETPLACE:
      return ingestBlurMarketplaceTransaction(block, transaction);
    default:
      return [];
  }
}
