import { Block } from 'src/models/block';
import { Transaction } from 'src/models/transaction';
import { looksRareExchangeInterface } from './test';
import { parseEther } from 'ethers';
import { print } from 'src/utilities/print';
import { Sale } from 'src/models/sale';
import { LooksRareABIMethods } from './looks-rare-abi';

export function ingestLooksRareTransaction(
  block: Block,
  transaction: Transaction
): Sale[] {
  const parsedTransaction = looksRareExchangeInterface.parseTransaction({
    data: transaction.inputData,
    value: parseEther('1.0'),
  });

  print(parsedTransaction?.args.toObject());

  switch (parsedTransaction?.name as LooksRareABIMethods) {
  }

  return [];
}
