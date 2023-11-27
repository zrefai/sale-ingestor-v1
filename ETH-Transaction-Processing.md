## Table of contents

- [ETH transaction processing for swapEase](#eth-transaction-processing-for-swapease)
- [Processing transactions via marketplace](#procesing-transactions-via-marketplace)
- [Opensea](#opensea)
- [Blur](#blurio)
- [LooksRare](#looksrare)
- [X2Y2](#x2y2)

## ETH Transaction Processing for SwapEase

For the purposes of giving the customer the most up-to-date data, we will be processing transactions from marketplaces such as **OpenSea** and **Blur** for ERC-721 NFT collections as they occur on the ETH blockchain. These transactions are used for examining trends within the clusters that we generate for each NFT collection a customer tracks.

Future improvements can include transactions from marketplaces such as **LooksRare** and **X2Y2**

### Necessary data for a transaction

Here we define the variables that we want to track within a transaction:

- **buyerAddress**: The address receiving the token.
- **sellerAddress**: The address offering the token.
- **transactionHash**: The hash of the transaction the sale occurred in.
- **marketplace**: The marketplace where the transaction occurred. This can be **seaport** or **blur**.
- **contractAddress**: The contract address of the NFT collection.
- **tokenId**: The ID of the NFT within the NFT collection.
- **fee**: A fee is more of an object. It can be the seller's fee, protocol fee, or even the royalty fee. There are 2 parts to a fee:
  - **amount**: The amount spent during the transaction
  - **tokenAddress**: The address for the token spent
- **blockNumber**: The block number the transaction took place in.
- **blockTimestamp**: The timestamp when the block was mined.

### Specifications for different token types we will come across

When looking at a transaction from the ETH blockchain, we come across many different methods. Here, we want to examine the specification for the common token type we will certainly come across in transaction logs. A specification details how we interact with a particular token.

#### ERC-20

The format of an ERC-20 transfer log is Transfer(address from, address to, uint256 value)

- Keccak hash for Transfer(address, address, uint256): 0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef
- Number of topics emitted: 3

#### ERC-721

The format of an ERC-721 transfer log is Transfer(address from, address to, uint256 value)

- Keccak hash for Transfer(address, address, uint256): 0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef
- Number of topics emmitted: 4

#### ERC-1155

The format of an ERC-1155 transfer single log is TransferSingle(address operator, address from, address to, uint256 id, uint256 value)

- Keccak hash for TransferSingle(address, address, address, uint256, uint256): 0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62
- Number of topics emmitted: 4

The format of an ERC-1155 transfer batch log is TransferBatch(address operator, address from, address to, uint256[] ids, uint256[] values)

- Keccak has for TransferBatch(address, address, address, uint256[], uint256[]): 15a20852969264834106e41fd7b33f8f74d0f438687b383ca8bd797816039529'
- Number of topics emmitted: </find the answer>

## Procesing transactions via marketplace

Here are all the transactions happening for each marketplace we want to ingest:

- **OpenSea**: https://etherscan.io/advanced-filter?eladd=0x00000000000000adc04c56bf30ac9d3c0aaf14dc
- **Blur**: https://etherscan.io/advanced-filter?eladd=0x000000000000ad05ccc4f10045630fb830b95127

> **_NOTE:_** Blur exchange has a total of 3 versions. Each version processes different kinds of transactions. The marketplace listed above is for Blur V1. Blur V2 and V3 are listed further below.

We are using Alchemys Webhooks to receive transactions from the blockchain as they occurr. These webhooks allow us to filter by contract addresses or even logs to help us narrow down our search for the right kinds of transactions.

**There are two ways by which we can get sales from any marketplace on the ETH blockchain:**

- We can filter by the marketplace's contract address (contract addresses vary by marketplace)
- We can filter by logs for any topic that matches a specified sale event (sale events vary by a marketplace's contract)

**We need to understand what methods are available to us for each marketplace**:

Methods are the functions executed during the transaction. A method can help us idenfity the kind of transaction that occurred. Although we want to look at specific events within logs (we go over what events occur for each marketplace), these events can be used across different kinds of transactions within a marketplace. For example, a Fulfill Advanced Order method from Opensea deals specifically in ERC-1155 token sales whether by ETH or WETH. We don't want to look at ERC-115 tokens for clustering, which is why we need to ensure that the right methods are examined when looking at a transaction.

To determine what method is being used in a transaction, we can take a look at the first 8 digits in the input data of a transaction.

**We are looking to process the data fields from specific events from specific contracts. These data fields contain all the data we need about a transaction.**

- Data fields can look like this:

```
// This is an OpenSea OrderFulfilled event data payload
cb5a6750cf6096ec459ce054324c46803b503d9e2414e8e1ada5871aefd2685a
000000000000000000000000500ae19977602862eeb6263821a1fa7f8ff6947b
0000000000000000000000000000000000000000000000000000000000000080
0000000000000000000000000000000000000000000000000000000000000120
0000000000000000000000000000000000000000000000000000000000000001
0000000000000000000000000000000000000000000000000000000000000002
000000000000000000000000a5b276d7c697a7fbb3437253f3fd7eeed852950f
000000000000000000000000000000000000000000000000000000000000094b
0000000000000000000000000000000000000000000000000000000000000001
0000000000000000000000000000000000000000000000000000000000000003
0000000000000000000000000000000000000000000000000000000000000000
0000000000000000000000000000000000000000000000000000000000000000
0000000000000000000000000000000000000000000000000000000000000000
0000000000000000000000000000000000000000000000000033b125dd7b6000
000000000000000000000000f2ade2cf15fa624a95c32d512389c4feb98e7969
0000000000000000000000000000000000000000000000000000000000000000
0000000000000000000000000000000000000000000000000000000000000000
0000000000000000000000000000000000000000000000000000000000000000
0000000000000000000000000000000000000000000000000001550f7dca7000
0000000000000000000000000000a26b00c1f0df003000390027140000faa719
0000000000000000000000000000000000000000000000000000000000000000
0000000000000000000000000000000000000000000000000000000000000000
0000000000000000000000000000000000000000000000000000000000000000
000000000000000000000000000000000000000000000000000044364c5bb000
000000000000000000000000b14276d8da92bd0c71506f62c27827d072bb38f9
```

Data for this will come from Alchemy's Webhooks. Here is the query we are using:

```graphql
{
  block {
    number
    timestamp
    gasLimit
    gasUsed
    transactions(
      filter: {
        addresses: [
          # Seaport 1.5
          { to: "0x00000000000000adc04c56bf30ac9d3c0aaf14dc" }
          # Blur.io Marketplace
          { to: "0x000000000000Ad05Ccc4F10045630fb830B95127" }
        ]
      }
    ) {
      hash
      index
      from {
        address
      }
      to {
        address
      }
      value
      gas
      gasPrice
      maxFeePerGas
      maxPriorityFeePerGas
      gasUsed
      status
      inputData
      logs {
        index
        account {
          address
        }
        topics
        data
      }
    }
  }
}
```

## OpenSea

- **Seaport 1.5 Contract Address**: 0x00000000000000ADc04C56Bf30aC9d3c0aAF14dC
- **Topic for OrderFulfilled Event**: 0x9d9af8e38d66c62e2c12f0225249fd9d721c54b83f48d9352c97c6cacdcb6f31

### OpenSea Methods:

- **0xa8174404** (`matchOrders`)
- **0xf2d12b12** (`matchAdvancedOrders`)
- **0xb3a34c4c** (`fulfillOrder`)
- **0xfb0f3ee1** (`fulfillBasicOrder`): Six permutations are valid in this method:
  - Native token to ERC721
  - Native token to ERC1155
  - ERC20 to ERC721
  - ERC20 to ERC1155
  - ERC721 to ERC20
  - ERC1155 to ERC20
- **0x00000000** (`fulfillBasicOrder_efficient_6GL6yc`): Six permutations are valid in this method:
  - Native token to ERC721
  - Native token to ERC1155
  - ERC20 to ERC721
  - ERC20 to ERC1155
  - ERC721 to ERC20
  - ERC1155 to ERC20
- **0xe7acab24** (`fulfillAdvancedOrder`)
- **0xed98a574** (`fulfillAvailableOrders`)
- **0x87201b41** (`fulfillAvailableAdvancedOrders`)

### Structure of an OrderFulfilled Event

Checking the logs on an OpenSea transaction, we should find an OrderFulfilled Event. This marks a sale.

OrderFulfilled Event: ([File 16 of 42: BasicOrderFulfiller.sol](https://etherscan.io/address/0x00000000000000adc04c56bf30ac9d3c0aaf14dc#code#F16#L1004)):

- After the order hash has been created, Seaport 1.5 emits the OrderFulfilled event:

```solidity
event OrderFulfilled(
  bytes32 orderHash,
  address indexed offerer,
  address indexed zone,
  address fulfiller,
  SpentItem[] offer,
      > (itemType, token, id, amount)
  ReceivedItem[] consideration
      > (itemType, token, id, amount, recipient)
)
```

- An OrderFulfilled event emits these topics:

```
topic[0] - OrderFulfilled event signature
topic[1] - offerer
topic[2] - zone
```

- An OrderFulfilled event comes with this breakdown for the data field:
  - 0x00: orderHash
  - 0x20: fulfiller
  - 0x40: offer offset (0x80)
  - 0x60: consideration offset (0x120)
  - 0x80: offer.length (1)
  - 0xa0: offerItemType
  - 0xc0: offerToken
  - 0xe0: offerIdentifier
  - 0x100: offerAmount
  - 0x120: consideration.length (1 + additionalRecipients.length)
  - 0x140: considerationItemType
  - 0x160: considerationToken
  - 0x180: considerationIdentifier
  - 0x1a0: considerationAmount
  - 0x1c0: considerationRecipient

## Blur.io

- **Blur Contract Address**: 0x000000000000Ad05Ccc4F10045630fb830B95127
- **Topic for OrdersMatched Event**: 0x61cbb2a3dee0b6064c2e681aadd61677fb4ef319f0b547508d495626f5a62f64

### Blur Methods:

#### Blur.io Marketplace: [0x000000000000Ad05Ccc4F10045630fb830B95127](https://etherscan.io/address/0x000000000000Ad05Ccc4F10045630fb830B95127)

- **0xb3be57f8** (`bulkExecute`)
- **0x9a1fc3a7** (`execute`)

#### Blur.io Marketplace 2: [0x39da41747a83aeE658334415666f3EF92DD0D541](https://etherscan.io/address/0x39da41747a83aee658334415666f3ef92dd0d541)

- **0x9a2b8115** (`batchBuyWithETH`)
- **0x09ba153d** (`batchBuyWithERC20s`)
  - [Transaction](https://etherscan.io/tx/0xea2e876e7c5e4fcd566b985c9332ec66b842981ba350b1ba4fcb66c907ad88ec#eventlog) where seaport was used to buy from Blur

#### Blur.io Marketplace 3: [0xb2ecfE4E4D61f8790bbb9DE2D1259B9e2410CEA5](https://etherscan.io/address/0xb2ecfe4e4d61f8790bbb9de2d1259b9e2410cea5)

- **0x3925c3c3** (`takeAsk`)
- **0x133ba9a6** (`takeAskPool`)
- **0x70bce2d6** (`takeAskSingle`)
- **0x336d8206** (`takeAskSinglePool`)
- **0x7034d120** (`takeBid`)
- **0xda815cb5** (`takeBidSingle`)

### Structure of an OrdersMatched Event

Checking the logs on a Blur transaction, we should find an OrdersMatched event. This marks a sale.

Structure of an OrdersMatched Event: ([File 1 of 19 : BlurExchange.sol](https://etherscan.io/address/0x983e96c26782a8db500a6fb8ab47a52e1b44862d#code#F1#L100))

Structure of an Order Struct: ([File 13 of 19 : OrderStructs.sol](https://etherscan.io/address/0x983e96c26782a8db500a6fb8ab47a52e1b44862d#code#F13#L13))

- The BlurExchange protocol emits an OrdersMatched event:

```solidity
event OrdersMatched(
  address indexed maker,
  address indexed taker,
  Order sell,
  bytes32 sellHash,
  Order buy,
  bytes32 buyHash
);
```

- An OrdersMatched event emits these topics:

```
topic[0] - OrdersMatched event signature
topic[1] - maker
topic[2] - taker
```

- This is the structure of an Order within the OrdersMatched event:

```solidity
struct Order {
  address trader;
  Side side;
  address matchingPolicy;
  address collection;
  uint256 tokenId;
  uint256 amount;
  address paymentToken;
  uint256 price;
  uint256 listingTime;
  /* Order expiration timestamp - 0 for oracle cancellations. */
  uint256 expirationTime;
  Fee[] fees;
  uint256 salt;
  bytes extraParams;
}
```

Blur does not have an explicit line by line translation of the data field like OpenSea does. We use the Order Struct to figure out what exists where:

- **trader**: Address that determines either the maker or the taker depending on whether you are looking at the sell or buy Order in the data field
- **side**: Side an enumeration for either Buy or Sell (0 or 1)
- **matchingPolicy**: Address determining the policy
- **collection**: Address of the collection
- **tokenId**: Uint256 of the tokenId within the collection
- **amount**: Uint256 of the amount of the tokenId
- **paymentToken**: Address of the token (ETH/WETH/BLUR)
- **price**: Uint256 of the amount payed of the paymentToken
- **listingTime**: Uint256 of the time the listing was made
- **expirationTime**: Uint256 of the time the listing is going to expire
- **fees**: Aray of fees:
  - **rate**: Uint16 of the rate to pay
  - **recipient**: Address of the recipient of the rate
- **salt**: Uint256 of the salt, computed as the address from the address of the creating contract, the (creation) bytecode of the created contract and the constructor arguments.
- **extraParams**: Bytes

///////------------------------FOR FUTURE DEVELOPMENT------------------------///////

## LooksRare

- **LooksRare Contract Address**: 0x0000000000E655fAe4d56241588680F86E3b2377
- **Topic for TakerBid Event**: 0x3ee3de4684413690dee6fff1a0a4f92916a1b97d1c5a83cdf24671844306b2e3

### LooksRare Methods:

- **0x760f2a0b** (`execute`)

Checking the logs on a LooksRare transaction, we should find a TakerBid Event. This marks a sale even though etherscan labels it as a Transfer. It is emitted when a taker bid transaction is completed.

```solidity
event TakerBid(
  NonceInvalidationParameters nonceInvalidationParameters,
  address bidUser, // taker (initiates the transaction)
  address bidRecipient, // taker (receives the NFT)
  uint256 strategyId,
  address currency,
  address collection,
  uint256[] itemIds,
  uint256[] amounts,
  address[2] feeRecipients,
  uint256[3] feeAmounts
);
```

- A TakerBid event emits this one topic:

```
topic[0] - 0x3ee3de4684413690dee6fff1a0a4f92916a1b97d1c5a83cdf24671844306b2e3 (keccak hash for TakerBid)
```

A TakerBid event comes with these parameters, which can help us decipher what the data field contains. LooksRare does not have an explicit line by line translation of the data field like OpenSea does. We use these parameters to figure out what exists where:

- **nonceInvalidationParameters**: Struct about nonce invalidation parameters
- **bidUser**: Address of the bid user
- **bidRecipient**: Address of the recipient of the bid
- **strategyId**: Uint256 of the strategy
- **currency**: Address of the currency
- **collection**: Address of the collection
- **itemIds**: Array of item ids
- **amounts**: Array of amounts (for item ids)
- **feeRecipients** Array of fee recipients
  - **feeRecipients[0]** User who receives the proceeds of the sale (it is the maker ask user)
  - **feeRecipients[1]** Creator fee recipient (if none, address(0))
- **feeAmounts** Array of fee amounts
  - **feeAmounts[0]** Fee amount for the user receiving sale proceeds
  - **feeAmounts[1]** Creator fee amount
  - **feeAmounts[2]** Protocol fee amount prior to adjustment for a potential affiliate payment

## X2Y2

- **X2Y2 Exhange Contract Address**: 0x74312363e45DCaBA76c59ec49a7Aa8A65a67EeD3
- **Topic for EvProfit Event**: 0xe2c49856b032c255ae7e325d18109bc4e22a2804e2e49a017ec0f59f19cd447b
- **Topic for EvInventory Event**: 0x3cbb63f144840e5b1b0a38a7c19211d2e89de4d7c5faf8b2d3c1776c302d1d33

Checking the logs on an X2Y2 transaction, we should find an EvProfit and EvInventory Events. This marks a sale.

### Structure of an EvProfit and EvInventory Event:

Structure of an EvProfit and EvInventory Event: ([File 1 of 14: XY2Y_r1.sol](https://etherscan.io/address/0x6d7812d41a08bc2a910b562d8b56411964a4ed88#code#F1#L201)):

Other relevant constants: ([File 4 of 14: MarketConsts.sol](https://etherscan.io/address/0x6d7812d41a08bc2a910b562d8b56411964a4ed88#code#F4#L31))

- After the order hash has been created, XY2Y emits an EvProfit event depending on the operation being performed. This event will always be emitted with an EvInventory event. When a `COMPLETE_BUY_OFFER`, `COMPLETE_SELL_OFFER`, or `COMPLETE_AUCTION` operation is executed, EvProfit is emitted:

```solidity
event EvProfit(
  bytes32 itemHash,
  address currency,
  address to,
  uint256 amount);
```

- An EvProfit event emits these topics:

```
topic[0] - EvProfit event signature
topic[1] - src
topic[2] - dst
```
