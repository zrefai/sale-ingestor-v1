import { readFileSync, writeFileSync } from 'fs';
import { IngestTransaction } from './ingest-transaction';
import { mapAlchemyGraphQLResponse } from './mappers/map-alchemy-graphql-response';

const data = readFileSync('webhook-response.json', 'utf8');
const jsonData = JSON.parse(data);

const mappedBody = mapAlchemyGraphQLResponse(jsonData);
const newTransaction = new IngestTransaction(mappedBody.event.data.block);

const sales = newTransaction.ingestTransactions();

try {
  writeFileSync('./sales.json', JSON.stringify(sales), 'utf8');
} catch (err) {
  console.error('Error writing to the file:', err);
}
