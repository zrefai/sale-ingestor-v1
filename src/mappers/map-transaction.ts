import { Transaction } from 'src/models/transaction';
import { mapLog } from './map-log';

export function mapTransaction(trx: any): Transaction {
  return {
    hash: trx.hash,
    index: trx.index,
    from: {
      address: trx.from.address,
    },
    to: {
      address: trx.to.address,
    },
    value: trx.value,
    gas: trx.gas,
    gasPrice: trx.gasPrice,
    maxFeePerGas: trx.maxFeePerGas,
    maxPriorityFeePerGas: trx.maxPriorityFeePerGas,
    gasUsed: trx.gasUsed,
    status: trx.status,
    inputData: trx.inputData,
    logs: trx.logs.map((log: any) => mapLog(log)),
  };
}
