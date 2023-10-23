import { Account } from './account';
import { Log } from './log';

export interface Transaction {
  hash: string;
  index: number;
  from: Account;
  to: Account;
  value: string;
  gas: number;
  gasPrice: string;
  maxFeePerGas: string;
  maxPriorityFeePerGas: string;
  gasUsed: number;
  status: number;
  inputData: string;
  logs: Log[];
}
