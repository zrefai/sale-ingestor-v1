import { Block } from 'src/models/block';
import { Transaction } from 'src/models/transaction';
import { blurMarketplaceInterface } from './ABIs/abi-interfaces';
import { parseEther } from 'ethers';
import {
  BlurExchangeABIMethodNames,
  ORDERS_MATCHED_KECCAK_HASH,
} from './ABIs/blur-abi';
import { Log } from 'src/models/log';
import util from 'util';
import { mapOrdersMatchedLog } from './mappers/map-orders-matched-log';
import { OrdersMatchedLog } from './models/orders-matched';

/**
 * bulkExecute transactions:
 * - Maybe if there is only 1 OrdersMatched log its not valid? I am not seeing any NFTs actually being traded in a sale like this https://etherscan.io/tx/0xeebb4aa58c2085bbb4f1363778c7c4d67e0f16eaceba521131bedd09a56bcaaf#eventlog
 * - Above could be incorrect, here is a sale with 1 NFT that actually has an NFT in it https://etherscan.io/tx/0x83ee3d3d2eef110c51abba0a4c59cd154fde1686c97de8eeb1d539187e9e9f9c
 * - Maybe we could check the number of Approval and Transfer logs that exist. Approval logs correspond with an NFT transfer, Transfer logs that move currency around do not require an approval log. This is more in line with what etherscan is doing to parse the transaction
 * Sale of 4 NFTs for Blur Pool token (ETH), but first ordersMatched log contains actual price. Others contain only 1 wei https://etherscan.io/tx/0x63ede2d2124a0371a689727824de3d59bb2a59cd81da9688e6f6874d1a340c53
 * Sale of 1 NFTs for Blur Pool, but only one ordersMatched log unlike the one above (requires more examination) https://etherscan.io/tx/0xfec3e3e72e18139d50910c7a9931703377d13afd1d55e4e318c592fe0b740e8d
 * Sale of 2 NFTs for ETH, prices exist in orders matched logs https://etherscan.io/tx/0xee4eafc96ababde161cab2181476c6d23be93ea254e0771b844ad934083af885
 */

export function ingestBlurMarketplaceTransaction(
  block: Block,
  transaction: Transaction
) {
  const parsedTransaction = blurMarketplaceInterface.parseTransaction({
    data: transaction.inputData,
    value: parseEther('1.0'),
  });

  switch (parsedTransaction?.name as BlurExchangeABIMethodNames) {
    case 'execute': {
      const ordersMatchedLogs = parseTransactionLogs(transaction.logs);
      console.log(util.inspect(ordersMatchedLogs, false, null, true));
      return [];
    }
    case 'bulkExecute':
    default:
      return [];
  }
}

function parseTransactionLogs(logs: Log[]) {
  const ordersMatchedLogs: OrdersMatchedLog[] = [];
  for (const log of logs) {
    if (log.topics[0] === ORDERS_MATCHED_KECCAK_HASH) {
      const parsedLog = blurMarketplaceInterface.parseLog({
        topics: log.topics,
        data: log.data,
      });

      if (parsedLog) {
        ordersMatchedLogs.push(mapOrdersMatchedLog(parsedLog));
      }
    }
  }

  return ordersMatchedLogs;
}
