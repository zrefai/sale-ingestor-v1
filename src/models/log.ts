import { Account } from './account';

export interface Log {
  index: number;
  account: Account;
  topics: string[];
  data: string;
}
