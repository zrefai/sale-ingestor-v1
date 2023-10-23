import { Log } from 'src/models/log';

export function mapLog(log: any): Log {
  return {
    index: log.index,
    account: {
      address: log.account.address,
    },
    topics: log.topics,
    data: log.data,
  };
}
