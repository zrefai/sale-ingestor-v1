import { LogDescription, formatEther } from 'ethers';
import { TakerBidLog } from '../models/taker-bid';

export function mapTakerBid(parsedLog: LogDescription): TakerBidLog {
  const args = parsedLog.args.toObject();
  const nonceInvalidationParameters =
    args.nonceInvalidationParameters.toObject();
  const feeRecipients = args.feeRecipients.toArray();
  const feeAmounts = args.feeAmounts.toArray();

  return {
    nonceInvalidationParameters: {
      orderHash: nonceInvalidationParameters.orderHash,
      orderNonce: Number(nonceInvalidationParameters.orderNonce),
      isNonceInvalidated: nonceInvalidationParameters.isNonceInvalidated,
    },
    bidUser: args.bidUser,
    bidRecipient: args.bidRecipient,
    strategy: Number(args.strategy),
    currency: args.currency,
    collection: args.collection,
    itemIds: args.itemIds.toArray().map((itemId: any) => Number(itemId)),
    amounts: args.amounts.toArray().map((amount: any) => Number(amount)),
    feeRecipients: {
      feeRecipient: feeRecipients[0],
      creatorFeeRecipient: feeRecipients[1],
    },
    feeAmounts: {
      amount: Number(formatEther(feeAmounts[0])),
      creatorFeeAmount: Number(formatEther(feeAmounts[1])),
      protocolFeeAmount: Number(formatEther(feeAmounts[2])),
    },
  };
}
