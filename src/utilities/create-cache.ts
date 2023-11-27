import { getAllContractAddresses } from 'data/collection-metadata';

export async function createCache() {
  const cursor = getAllContractAddresses();
  const cursorArray = await cursor.toArray();

  const contractAddresses = new Set<string>();

  for (const document of cursorArray) {
    contractAddresses.add(document.contractAddress);
  }

  return contractAddresses;
}
