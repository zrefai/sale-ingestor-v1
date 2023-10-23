import { Block } from 'src/models/block';
import { mapTransaction } from './map-transaction';

export function mapBlock(block: any): Block {
  return {
    number: block.number,
    timestamp: block.timestamp,
    gasLimit: block.gasLimit,
    gasUsed: block.gasUsed,
    transactions: block.transactions.map((transaction: any) =>
      mapTransaction(transaction)
    ),
  };
}
