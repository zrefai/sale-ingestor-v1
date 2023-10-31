import { readFileSync, writeFileSync } from 'fs';
import { mapAlchemyGraphQLResponse } from './mappers/map-alchemy-graphql-response';
import { ingestTransactions } from './ingest-transaction';

const data = readFileSync('webhook-response.json', 'utf8');
const jsonData = JSON.parse(data);

const mappedBody = mapAlchemyGraphQLResponse(jsonData);
const sales = ingestTransactions(mappedBody.event.data.block);

try {
  writeFileSync('./sales.json', JSON.stringify(sales), 'utf8');
} catch (err) {
  console.error('Error writing to the file:', err);
}
