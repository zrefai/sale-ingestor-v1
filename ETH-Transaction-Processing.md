# ETH Transaction Processing for SwapEase

For the purposes of giving the customer the most up-to-date data, we will be processing transactions from marketplaces such as **OpenSea**, **Blur**, **LooksRare**, and **X2Y2** for ERC-721 NFT collections as they occur on the ETH blockchain. These transactions are used for examining trends within the clusters that we generate for each NFT collection a customer tracks.

## Necessary data for a transaction

Here we define the variables that we want to track within a transaction:

- **marketplace**: The marketplace where the transaction occurred. This can be **seaport**, **blur**, **x2y2**, or **looksrare**.
- **contractAddress**: The contract address of the NFT collection.
- **tokenId**: The ID of the NFT within the NFT collection.
- **fee**: A fee is more of an object. It can be the seller's fee, protocol fee, or even the royalty fee. There are 4 parts to a fee:
  - **amount**: The amount spent during the transaction
  - **tokenAddress**: The address for the token spent
  - **symbol**: The symbol for the token address (this will be only ETH or WETH for now)
  - **decimals**: The amount of decimals to divide by when performing operations on the amount
- **blockNumber**: The block number the transaction took place in
- **timestamp**: The time stamp for when the block was mined

## Specifications for different token types we will come across

When looking at a transaction from the ETH blockchain, we come across many different methods. Here, we want to examine the specification for the common token type we will certainly come across in transaction logs. A specification details how we interact with a particular token.

### ERC-20

The format of an ERC-20 transfer log is Transfer(address from, address to, uint256 value)

- Keccak hash for Transfer(address, address, uint256): 0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef
- Number of topics emitted: 3

### ERC-721

The format of an ERC-721 transfer log is Transfer(address from, address to, uint256 value)

- Keccak hash for Transfer(address, address, uint256): 0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef
- Number of topics emmitted: 4

### ERC-1155

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
- **LooksRare**: https://etherscan.io/advanced-filter?eladd=0x0000000000e655fae4d56241588680f86e3b2377
- **X2Y2**: https://etherscan.io/advanced-filter?eladd=0x74312363e45dcaba76c59ec49a7aa8a65a67eed3

We are using Alchemys Webhooks to receive transactions from the blockchain as they occurr. These webhooks allow us to filter by contract addresses or even logs to help us narrow down our search for the right kinds of transactions.

**There are two methods by which we can get sales from any marketplace on the ETH blockchain:**

- We can filter by the marketplace's contract address (contract addresses vary by marketplace)
- We can filter by logs for any topic that matches a specified sale event (sale events vary by a marketplace's contract)

**We need to understand what methods are available to us for each marketplace**:

A method can help us idenfity the kind of transaction that occurred. Although we want to look at specific events within logs (we go over what events occur for each marketplace), these events can be used across different kinds of transactions within a marketplace. For example, a Fulfill Advanced Order method from Opensea deals specifically in ERC-1155 token sales whether by ETH or WETH. We don't want to look at ERC-115 tokens for clustering, thus ensuring that the right methods are examined when looking at a transaction.

To determine what method is being used in a transaction, we can take a look at the first 8 digits in the input data of a transaction

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
  block(
    hash: "0xfe34c849b4b9e98d86a7f9a03c8960a39074f4f889b69cdf43e4b5fe78c86461"
  ) {
    number
    timestamp
    gasLimit
    gasUsed
    transactions {
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

### OpenSea

- **Seaport 1.5 Contract Address**: 0x00000000000000ADc04C56Bf30aC9d3c0aAF14dC
- **Topic for OrderFulfilled Event**: 0x9d9af8e38d66c62e2c12f0225249fd9d721c54b83f48d9352c97c6cacdcb6f31

#### OpenSea Methods:

- **0xa8174404** (`matchOrders`): Using ETH. ERC-721 sales. **_Almost_** each sale is close to 0 ETH. Some of them are actually just transfers, not sales. Match an arbitrary number of orders, each with an arbitrary number of items for offer and consideration along with a set of fulfillments allocating offer components to consideration components.
- **0xf2d12b12** (`matchAdvancedOrders`): Using WETH. ERC-721 sales.
- **0xb3a34c4c** (`fulfillOrder`): Using ETH, ERC-721 sales but mentions that `onERC1155Recieved` needs to be relevant to receive ERC1155 tokens. Fulfill an order with an arbitrary number of items for offer and consideration. Note that this function does not support criteria-based orders or partial filling of orders (though filling the remainder of a partially-filled order is supported). Some outlier transactions under this method:
  - [0x91e326fc75a6f5780c1e0bbaa1d29289261f88d19889b35164fc47b791eac41c](https://etherscan.io/tx/0x91e326fc75a6f5780c1e0bbaa1d29289261f88d19889b35164fc47b791eac41c)
  - [0x05efb0c5c381dc3b201243c102e5bdcb86909767b6c611e6433d549fd198d8bd](https://etherscan.io/tx/0x05efb0c5c381dc3b201243c102e5bdcb86909767b6c611e6433d549fd198d8bd)
  - [0xbf0762663e3ee50ae2722cefe0a276a87309856779875820f7dd5cfa79a5240e](https://etherscan.io/tx/0xbf0762663e3ee50ae2722cefe0a276a87309856779875820f7dd5cfa79a5240e)
- **0xfb0f3ee1** (`fulfillBasicOrder`): Six permutations are valid in this method:
  - Native token to ERC721
  - Native token to ERC1155
  - ERC20 to ERC721
  - ERC20 to ERC1155
  - ERC721 to ERC20
  - ERC1155 to ERC20
- **0x00000000** (`fulfillBasicOrder_efficient_6GL6yc`): This function costs less gas than `fulfillBasicOrder` due to the zero bytes in the function selector (0x00000000). Six permutations are valid in this method:
  - Native token to ERC721
  - Native token to ERC1155
  - ERC20 to ERC721
  - ERC20 to ERC1155
  - ERC721 to ERC20
  - ERC1155 to ERC20
- **0xe7acab24** (`fulfillAdvancedOrder`): Using ETH, WETH and other ERC-20. ERC-721 and ERC-1155 sales (but seeing primarily sales of ERC-1155). Fill an order, fully or partially, with an arbitrary number of items for offer and consideration alongside criteria resolvers containing specific token identifiers and associated proofs.
- **0xed98a574** (`fulfillAvailableOrders`): Using ETH and WETH. ERC-721 and ERC-1155 sales (but primarily sales of ERC-721). Attempt to fill a group of orders, each with an arbitrary number of items for offer and consideration. Any order that is not currently active, has already been fully filled, or has been cancelled will be omitted.
- **0x87201b41** (`fulfillAvailableAdvancedOrders`): Using ETH and WETH. ERC-721 and ERC-1155 sales (but primarily sales of ERC-721). Attempt to fill a group of orders, each with an arbitrary number of items for offer and consideration. Any order that is not currently active, has already been fully filled, or has been cancelled will be omitted. Advanced orders are the orders to fulfill along with the fraction of those orders to attempt to fill

Checking the logs on an OpenSea transaction, we should find an OrderFulfilled Event. This marks a sale.

#### Structure of an OrderFulfilled Event

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

#### Analysis of a data field for an OrderFulfilled event:

From [transaction](https://etherscan.io/tx/0x22e7cfabbccbae609e8b889f510d42fed92128a3332fd81fb0a60967139bba71)

We can look at the example data payload above

1. **Order Hash**:

   - `cb5a6750cf6096ec459ce054324c46803b503d9e2414e8e1ada5871aefd2685a`: This is the unique EIP712 hash that identifies the order.

2. **Fulfiller Address**:

   - `000000000000000000000000500ae19977602862eeb7263821a1fa7f8ff6947b`: Address of the entity that is fulfilling the order.

3. **Offer Array Pointer**:

   - `0000000000000000000000000000000000000000000000000000000000000080`: Points to the start of the offer array (`SpentItem[]`).

4. **Consideration Array Pointer**:

   - `0000000000000000000000000000000000000000000000000000000000000120`: Points to the start of the consideration array (`ReceivedItem[]`).

5. **Offer Details**:

   - Length: `0000000000000000000000000000000000000000000000000000000000000001`: There's one offered item.
   - ItemType: `0000000000000000000000000000000000000000000000000000000000000002`
   - Token Address: `000000000000000000000000a5b276d7c697a7fbb3437253f3fd7eeed852950f`
   - Identifier: `000000000000000000000000000000000000000000000000000000000000094b`
   - Amount: `0000000000000000000000000000000000000000000000000000000000000001`

6. **Received Items Details**:

   - Length: `0000000000000000000000000000000000000000000000000000000000000003`: Indicates there are 3 items being received.

   **First ReceivedItem**:

   - ItemType: `0000000000000000000000000000000000000000000000000000000000000000`
   - Token (ETH): `0000000000000000000000000000000000000000000000000000000000000000`
   - Identifier: `0000000000000000000000000000000000000000000000000000000000000000`
   - Amount: `0000000000000000000000000000000000000000000000000033b125dd7b6000`
   - Recipient: `000000000000000000000000f2ade2cf15fa624a95c32d512389c4feb98e7969`

   **Second ReceivedItem**:

   - ItemType: `0000000000000000000000000000000000000000000000000000000000000000`
   - Token (ETH): `0000000000000000000000000000000000000000000000000000000000000000`
   - Identifier: `0000000000000000000000000000000000000000000000000000000000000000`
   - Amount: `0000000000000000000000000000000000000000000000000001550f7dca7000`
   - Recipient: `0000000000000000000000000000a26b00c1f0df003000390027140000faa719` (ethereum-fee-collector)

   **Third ReceivedItem**:

   - ItemType: `0000000000000000000000000000000000000000000000000000000000000000`
   - Token (ETH): `0000000000000000000000000000000000000000000000000000000000000000`
   - Identifier: `0000000000000000000000000000000000000000000000000000000000000000`
   - Amount: `000000000000000000000000000000000000000000000000000044364c5bb000`
   - Recipient: `000000000000000000000000b14276d8da92bd0c71506f62c27827d072bb38f9`

### Blur.io

- **Blur Contract Address**: 0x000000000000Ad05Ccc4F10045630fb830B95127
- **Topic for OrdersMatched Event**: 0x61cbb2a3dee0b6064c2e681aadd61677fb4ef319f0b547508d495626f5a62f64

#### Blur Methods:

##### Blur.io Marketplace: [0x000000000000Ad05Ccc4F10045630fb830B95127](https://etherscan.io/address/0x000000000000Ad05Ccc4F10045630fb830B95127)

- **0xb3be57f8** (`bulkExecute`)
- **0x9a1fc3a7** (`execute`)

##### Blur.io Marketplace 2: [0x39da41747a83aeE658334415666f3EF92DD0D541](https://etherscan.io/address/0x39da41747a83aee658334415666f3ef92dd0d541)

- **0x9a2b8115** (`batchBuyWithETH`)
- **0x09ba153d** (`batchBuyWithERC20s`)
  - [Transaction](https://etherscan.io/tx/0xea2e876e7c5e4fcd566b985c9332ec66b842981ba350b1ba4fcb66c907ad88ec#eventlog) where seaport was used to buy from Blur

##### Blur.io Marketplace 3: [0xb2ecfE4E4D61f8790bbb9DE2D1259B9e2410CEA5](https://etherscan.io/address/0xb2ecfe4e4d61f8790bbb9de2d1259b9e2410cea5)

- **0x3925c3c3** (`takeAsk`)
- **0x133ba9a6** (`takeAskPool`)
- **0x70bce2d6** (`takeAskSingle`)
- **0x336d8206** (`takeAskSinglePool`)
- **0x7034d120** (`takeBid`)
- **0xda815cb5** (`takeBidSingle`)

Checking the logs on a Blur transaction, we should find an OrdersMatched event. This marks a sale.

#### Structure of an OrdersMatched Event

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

#### Analysis of a data field for an OrdersMatched event:

From [transaction](https://etherscan.io/tx/0x1d7eadfdb37704a883f1490c6d67fddc2bbf572b9ae56aca45070961213e512d)

```
0000000000000000000000000000000000000000000000000000000000000080
a8cbaf2ab4946491dc6acd6cc6a9fe80ee6badd01192c83cb9b347db405d4ec3
00000000000000000000000000000000000000000000000000000000000002c0
f8d05c3fcdf0025321026d475c5a466bb7da9038a86ab143f2362ec12deb5f8e
000000000000000000000000aaa42e5faa464bba9aa79d8499bc6abee139f818
0000000000000000000000000000000000000000000000000000000000000001
0000000000000000000000000000000000dab4a563819e8fd93dba3b25bc3495
000000000000000000000000e5af63234f93afd72a8b9114803e33f6d9766956
0000000000000000000000000000000000000000000000000000000000000ca4
0000000000000000000000000000000000000000000000000000000000000001
0000000000000000000000000000000000000000000000000000000000000000
00000000000000000000000000000000000000000000000000376c1e0a7f0000
000000000000000000000000000000000000000000000000000000006491356c
00000000000000000000000000000000000000000000000000000000657e836b
00000000000000000000000000000000000000000000000000000000000001a0
000000000000000000000000000000006f235ebb3bc4fad8a38f80501a3eafa2
0000000000000000000000000000000000000000000000000000000000000200
0000000000000000000000000000000000000000000000000000000000000001
0000000000000000000000000000000000000000000000000000000000000032
0000000000000000000000009532fc6cd07fa32c1bed256d5f7dad53a35ac195
0000000000000000000000000000000000000000000000000000000000000001
0100000000000000000000000000000000000000000000000000000000000000
000000000000000000000000ae4705dc0816ee6d8a13f1c72780ec5021915fed
0000000000000000000000000000000000000000000000000000000000000000
0000000000000000000000000000000000dab4a563819e8fd93dba3b25bc3495
000000000000000000000000e5af63234f93afd72a8b9114803e33f6d9766956
0000000000000000000000000000000000000000000000000000000000000ca4
0000000000000000000000000000000000000000000000000000000000000001
0000000000000000000000000000000000000000000000000000000000000000
00000000000000000000000000000000000000000000000000376c1e0a7f0000
000000000000000000000000000000000000000000000000000000006491356d
0000000000000000000000000000000000000000000000000000000064ffdad1
00000000000000000000000000000000000000000000000000000000000001a0
000000000000000000000000000000004c4a838f4e5b39ad2ed55cf6835e9dc5
00000000000000000000000000000000000000000000000000000000000001c0
0000000000000000000000000000000000000000000000000000000000000000
0000000000000000000000000000000000000000000000000000000000000001
0100000000000000000000000000000000000000000000000000000000000000
```

1. **Sell Order Pointer**:

   - `0000000000000000000000000000000000000000000000000000000000000080`: Points to the sell Order.

2. **Sell Order Hash**:

   - `a8cbaf2ab4946491dc6acd6cc6a9fe80ee6badd01192c83cb9b347db405d4ec3`: This is the unique EIP712 hash that identifies the sell order.

3. **Buy Order Pointer**:

   - `00000000000000000000000000000000000000000000000000000000000002c0`: Points to the buy Order.

4. **Buy Order Hash**:

   - `0000000000000000000000000000000000000000000000000000000000000120`: This is the unique EIP712 hash that identifies the buy order.

5. **Sell Order**:

   - **Trader**:
     - `000000000000000000000000aaa42e5faa464bba9aa79d8499bc6abee139f818`: Address of the trader.
   - **Side**:
     - `0000000000000000000000000000000000000000000000000000000000000001`: The side (1).
   - **Matching Policy**:
     - `0000000000000000000000000000000000dab4a563819e8fd93dba3b25bc3495`: The matching policy.
   - **Collection Address**:
     - `000000000000000000000000e5af63234f93afd72a8b9114803e33f6d9766956`: The address of the collection.
   - **Token ID**:
     - `0000000000000000000000000000000000000000000000000000000000000ca4`: The token ID belonging to the collection above.
   - **Amount**:
     - `0000000000000000000000000000000000000000000000000000000000000001`: Amount of the token above.
   - **Payment Token**:
     - `0000000000000000000000000000000000000000000000000000000000000000`: Address of the token used to pay for the token.
   - **Price**:
     - `00000000000000000000000000000000000000000000000000376c1e0a7f0000`: Amount of the payment token.
   - **Listing Time**:
     - `000000000000000000000000000000000000000000000000000000006491356c`: Time the trade was listed.
   - **Expiration Time**:
     - `00000000000000000000000000000000000000000000000000000000657e836b`: The expiration time for the sale.
   - **Fees**: Have not been able to accurately find this.
   - **Salt**: Have not been able to accurately find this.
   - **Extra Params**: Have not been able to accurately find this.

6. **Buy Order**:
   - **Trader**:
     - `000000000000000000000000ae4705dc0816ee6d8a13f1c72780ec5021915fed`: Address of the buyer.
   - **Side**:
     - `0000000000000000000000000000000000000000000000000000000000000000`: The side (0)
   - **Matching Policy**:
     - `0000000000000000000000000000000000dab4a563819e8fd93dba3b25bc3495`: The matching policy.
   - **Collection Address**:
     - `000000000000000000000000e5af63234f93afd72a8b9114803e33f6d9766956`: The address of the collection.
   - **Token ID**:
     - `0000000000000000000000000000000000000000000000000000000000000ca4`: The token ID belonging to the collection above.
   - **Amount**:
     - `0000000000000000000000000000000000000000000000000000000000000001`: Amount of the token above.
   - **Payment Token**:
     - `0000000000000000000000000000000000000000000000000000000000000000`: Address of the token used to pay for the token.
   - **Price**:
     - `00000000000000000000000000000000000000000000000000376c1e0a7f0000`: Amount of the payment token.
   - **Listing Time**:
     - `000000000000000000000000000000000000000000000000000000006491356d`: Time the trade was listed.
   - **Expiration Time**:
     - `0000000000000000000000000000000000000000000000000000000064ffdad1`: The expiration time for the sale.
   - **Fees**: Have not been able to accurately find this.
   - **Salt**: Have not been able to accurately find this.
   - **Extra Params**: Have not been able to accurately find this.

### LooksRare

- **LooksRare Contract Address**: 0x0000000000E655fAe4d56241588680F86E3b2377
- **Topic for TakerBid Event**: 0x3ee3de4684413690dee6fff1a0a4f92916a1b97d1c5a83cdf24671844306b2e3

#### LooksRare Methods:

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

#### Analysis of a data field for a TakerBid event:

```
be197cfb6fcaaffdd9f8e0657d984fad3530547142c0746cdd31796d0cca86fe
0000000000000000000000000000000000000000000000000000000000000077
0000000000000000000000000000000000000000000000000000000000000001
0000000000000000000000002d242441903663d64e668c6cb11c9fa8699dddb4
0000000000000000000000002d242441903663d64e668c6cb11c9fa8699dddb4
0000000000000000000000000000000000000000000000000000000000000000
0000000000000000000000000000000000000000000000000000000000000000
000000000000000000000000f7f88d2a9497c974cd5f132a3db6a9ab82df78cd
00000000000000000000000000000000000000000000000000000000000001e0
0000000000000000000000000000000000000000000000000000000000000220
000000000000000000000000c4a396672f7d736a9550b7d3678a64081d74b624
0000000000000000000000000000000000000000000000000000000000000000
0000000000000000000000000000000000000000000000000158a85ad145c800
0000000000000000000000000000000000000000000000000000000000000000
0000000000000000000000000000000000000000000000000001bb60f053f800
0000000000000000000000000000000000000000000000000000000000000001
000000000000000000000000000000000000000000000000000000000000167d
0000000000000000000000000000000000000000000000000000000000000001
0000000000000000000000000000000000000000000000000000000000000001
```

1. **Order Hash**:

   - `be197cfb6fcaaffdd9f8e0657d984fad3530547142c0746cdd31796d0cca86fe`: This is the unique EIP712 hash that identifies the order.

2. **Order Nonce**:

   - `0000000000000000000000000000000000000000000000000000000000000077`: This is a 256-bit unsigned integer with a value of 119 in decimal.

3. **Is Nonce Invalidated**:

   - `0000000000000000000000000000000000000000000000000000000000000001`

4. **Bid User**:

   - `0000000000000000000000002d242441903663d64e668c6cb11c9fa8699dddb4`: Address of the bid user.

5. **Bid Receipient**:

   - `0000000000000000000000002d242441903663d64e668c6cb11c9fa8699dddb4`: Address of the bid recepient.

6. **Strategy ID**:

   - `0000000000000000000000000000000000000000000000000000000000000000`: Id of the strategy.

7. **Currency**:

   - `0000000000000000000000000000000000000000000000000000000000000000`: Address of the currency (in this case ETH).

8. **Collection Address**:

   - `000000000000000000000000f7f88d2a9497c974cd5f132a3db6a9ab82df78cd`: Address of the currency.

9. **Item Ids Pointer**:

   - `00000000000000000000000000000000000000000000000000000000000001e0`: Pointer value for item ids array (480 in decimal). This points to 480 bytes away, not the byte 480.

10. **Amounts array Pointer**:

    - `0000000000000000000000000000000000000000000000000000000000000220`: An array representing the number of each corresponding NFT item from itemIds being bid upon. The value here is the Pointer value for amounts array (544 in decimal). This points to 544 bytes away, not the byte 544.

11. **Fee Recipient (feeRecipients[0])**:

    - `000000000000000000000000c4a396672f7d736a9550b7d3678a64081d74b624`: The address that receives the ETH from the Bid User.

12. **Creator Fee Recipient (feeRecipients[1])**:

    - `0000000000000000000000000000000000000000000000000000000000000000`: Royalties for the contract address. There is none so address(0)

13. **Fee Amount (feeAmounts[0])**:

    - `0000000000000000000000000000000000000000000000000158a85ad145c800`: ETH sent to the Fee Recipient (converted: 97012500000000000).

14. **Creator Fee Amount (feeAmounts[1])**:

    - `0000000000000000000000000000000000000000000000000000000000000000`: ETH sent to the creator (royalties).

15. **Protocol Fee (feeAmounts[2])**

    - `0000000000000000000000000000000000000000000000000001bb60f053f800`: Protocol fee amount prior to adjustment.

16. **Item Ids length (where Item Ids Pointer leads to)**:

    - `0000000000000000000000000000000000000000000000000000000000000001`: There is only 1 Item in the Item Ids array.

17. **Start of the Item Ids array (first item in array)**:

    - `000000000000000000000000000000000000000000000000000000000000167d`: There is only 1 item in this array, and it is Item Ids 2884.

18. **Amounts array length (where Amounts array Pointer leads to)**:

    - `0000000000000000000000000000000000000000000000000000000000000001`: There is only 1 Item in the Amounts array.

19. **Start of the Amounts array (first item in array)**:
    - `0000000000000000000000000000000000000000000000000000000000000001`: There is only 1 amount for the 1 Item Id in the Item Ids array

### X2Y2

- **X2Y2 Exhange Contract Address**: 0x74312363e45DCaBA76c59ec49a7Aa8A65a67EeD3
- **Topic for EvProfit Event**: 0xe2c49856b032c255ae7e325d18109bc4e22a2804e2e49a017ec0f59f19cd447b
- **Topic for EvInventory Event**: 0x3cbb63f144840e5b1b0a38a7c19211d2e89de4d7c5faf8b2d3c1776c302d1d33

Checking the logs on an X2Y2 transaction, we should find an EvProfit and EvInventory Events. This marks a sale.

#### Structure of an EvProfit and EvInventory Event:

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

#### Analysis of a data field for an EvProfit event:

It is easy to decipher what the data payload for an EvProfit event:

```
130d292f17785f2cdc1862bcfae27ea90232597c9c77b882a8f76ad50d9feb37
0000000000000000000000000000000000000000000000000000000000000000
00000000000000000000000068c311a6896ba62583875bbf823a712cb4a27bca
000000000000000000000000000000000000000000000000039bb49f599a0000
```

1. **Item Hash**:

   - `130d292f17785f2cdc1862bcfae27ea90232597c9c77b882a8f76ad50d9feb37`: This is the unique EIP712 hash that identifies the item.

2. **Currency**:

   - `0000000000000000000000000000000000000000000000000000000000000000`: Address of the token (ETH).

3. **To**:

   - `00000000000000000000000068c311a6896ba62583875bbf823a712cb4a27bca`: The address the money is being sent to.

4. **Amount**:
   - `000000000000000000000000000000000000000000000000039bb49f599a0000`: The amount of the currency being sent to the **To** address.

- Here is what an EvInventory event looks like:

```solidity
event EvInventory(
  bytes32 indexed itemHash,
  address maker,
  address taker,
  uint256 orderSalt,
  uint256 settleSalt,
  uint256 intent,
  uint256 delegateType,
  uint256 deadline,
  IERC20Upgradeable currency,
  bytes dataMask,
  Market.OrderItem item,
  Market.SettleDetail detail
)
```

- An EvInventory event emits these topics:

```
topic[0] - EvInventory event signature
topic[1] - itemHash
```

#### Analysis of a data field for an EvInventory event:

```
00000000000000000000000068c311a6896ba62583875bbf823a712cb4a27bca
000000000000000000000000ef5e6661b39d99fcc351bf35d1581d9bd3022c70
000000000000000000000000000000005b12020113f40ae160582229db532bc9
000000000000000000000000000000000000000000000000000370901f70b300
0000000000000000000000000000000000000000000000000000000000000001
0000000000000000000000000000000000000000000000000000000000000001
00000000000000000000000000000000000000000000000000000000650a49c3
0000000000000000000000000000000000000000000000000000000000000000
0000000000000000000000000000000000000000000000000000000000000160
0000000000000000000000000000000000000000000000000000000000000180
0000000000000000000000000000000000000000000000000000000000000260
0000000000000000000000000000000000000000000000000000000000000000
000000000000000000000000000000000000000000000000039bb49f599a0000
0000000000000000000000000000000000000000000000000000000000000040
0000000000000000000000000000000000000000000000000000000000000080
0000000000000000000000000000000000000000000000000000000000000020
0000000000000000000000000000000000000000000000000000000000000001
000000000000000000000000f6ee484f82f28d69688f37fe90af514ce212b7c3
0000000000000000000000000000000000000000000000000000000000000646
0000000000000000000000000000000000000000000000000000000000000001
0000000000000000000000000000000000000000000000000000000000000000
0000000000000000000000000000000000000000000000000000000000000000
000000000000000000000000000000000000000000000000039bb49f599a0000
130d292f17785f2cdc1862bcfae27ea90232597c9c77b882a8f76ad50d9feb37
000000000000000000000000f849de01b080adc3a814fabe1e2087475cf2e354
0000000000000000000000000000000000000000000000000000000000000160
0000000000000000000000000000000000000000000000000000000000000000
0000000000000000000000000000000000000000000000000000000000000000
0000000000000000000000000000000000000000000000000000000000000000
0000000000000000000000000000000000000000000000000000000000000180
0000000000000000000000000000000000000000000000000000000000000000
0000000000000000000000000000000000000000000000000000000000000000
```

1. **Maker Address**:

   - `00000000000000000000000068c311a6896ba62583875bbf823a712cb4a27bca`: Address of the person who created the listing.

2. **Taker Address**:

   - `000000000000000000000000ef5e6661b39d99fcc351bf35d1581d9bd3022c70`: Address of the person who completed the listing.

3. **Order Salt**:

   - `000000000000000000000000000000005b12020113f40ae160582229db532bc9`

4. **Settle Salt**:

   - `000000000000000000000000000000000000000000000000000370901f70b300`

5. **Intent**:

   - `0000000000000000000000000000000000000000000000000000000000000001`:
     Intent can be one of three values.
     - INTENT_SELL = 1
     - INTENT_AUCTION = 2
     - INTENT_BUY = 3

6. **Delegate Type**:

   - `0000000000000000000000000000000000000000000000000000000000000001`: Delegate type can be one of three values.
     - INVALID = 0
     - ERC721 = 1
     - ERC1155 = 2

7. **Deadline**:

   - `00000000000000000000000000000000000000000000000000000000650a49c3`: Translates to a unix timestamp for when the listing expires.

8. **Currency**:

   - `0000000000000000000000000000000000000000000000000000000000000000`: Currency for this transaction is in ETH.
