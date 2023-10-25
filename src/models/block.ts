import { Transaction } from './transaction';

export interface Block {
  number: number;
  timestamp: number;
  gasLimit: number;
  gasUsed: number;
  transactions: (Transaction | null)[];
}
