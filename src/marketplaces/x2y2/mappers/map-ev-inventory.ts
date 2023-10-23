import {
  LogDescription,
  Result,
  formatEther,
  stripZerosLeft,
  toQuantity,
} from 'ethers';
import { DelegateType, EvInventoryLog, ItemData } from '../models/ev-inventory';

export function mapEvInventory(parsedLog: LogDescription): EvInventoryLog {
  const args = parsedLog.args.toObject();
  const item = args.item.toObject();
  const detail = args.detail.toObject();

  return {
    itemHash: args.itemHash,
    maker: args.maker,
    taker: args.taker,
    orderSalt: Number(args.orderSalt),
    settleSalt: Number(args.settleSalt),
    intent: Number(args.intent),
    delegateType: Number(args.delegateType) as DelegateType,
    deadline: Number(args.deadline),
    currency: args.currency,
    dataMask: args.dataMask,
    item: {
      price: Number(formatEther(item.price)),
      data: parseEvInventoryItemData(item.data),
    },
    detail: {
      op: Number(detail.op),
      orderIdx: Number(detail.orderIdx),
      itemIdx: Number(detail.itemIdx),
      price: Number(formatEther(detail.price)),
      itemHash: detail.itemHash,
      executionDelegate: detail.executionDelegate,
      dataReplacement: detail.dataReplacement,
      bidIncentivePct: Number(detail.bidIncentivePct),
      aucMinIncrementPct: Number(detail.aucMinIncrementPct),
      aucIncDurationSecs: Number(detail.aucIncDurationSecs),
      fees: detail.fees.map((fee: Result) => {
        const feeObj = fee.toObject();
        return { percentage: Number(feeObj.percentage), to: feeObj.to };
      }),
    },
  };
}

function parseEvInventoryItemData(data: string): ItemData {
  //Remove 0x prefix from string
  const cleanedData = data.substring(2);

  // Chunk data
  const chunkSize = 64;
  const chunks = [];

  for (let i = 0; i < cleanedData.length; i += chunkSize) {
    chunks.push(cleanedData.substring(i, i + chunkSize));
  }

  return {
    contractAddress: stripZerosLeft(`0x${chunks[2]}`),
    itemId: Number(toQuantity(`0x${chunks[3]}`)),
  };
}
