import { LogDescription } from 'ethers';
import { OrdersMatchedLog } from '../models/orders-matched';

export function mapOrdersMatchedLog(
  parsedLog: LogDescription
): OrdersMatchedLog {
  const args = parsedLog.args.toObject();

  return {
    orderHashes: args.orderHashes.toArray(),
  };
}
