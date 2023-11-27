import { db } from 'config/db-client';

const getCollection = () => db.collection('collectionMetadata');

const getAllContractAddresses = () => {
  return getCollection().find({}, { projection: { contractAddress: 1 } });
};

export { getAllContractAddresses };
