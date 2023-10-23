import { LogDescription, formatEther } from 'ethers';
import { EvProfitLog } from '../models/ev-profit';

export function mapEvProfit(parsedLog: LogDescription): EvProfitLog {
  const args = parsedLog.args.toObject();
  return {
    itemHash: args.itemHash,
    currency: args.currency,
    to: args.to,
    amount: Number(formatEther(args.amount)),
  };
}
