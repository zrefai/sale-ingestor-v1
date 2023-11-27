import dbClient from 'config/db-client.js';
import { createServer } from '../config/express.js';
import { ingestTransactions } from './ingest-transaction.js';
import { mapAlchemyGraphQLResponse } from './mappers/map-alchemy-graphql-response.js';
import { createCache } from './utilities/create-cache.js';
import { print } from './utilities/print.js';

const PORT = 3000;

async function startServer() {
  const app = createServer();

  const contractAddresses = await createCache();

  app.get('/ping', (_req, res) => {
    return res.send('pong');
  });

  app.post('/webhook', async (req, res) => {
    const data = mapAlchemyGraphQLResponse(req.body);
    const sales = ingestTransactions(data.event.data.block);

    print(sales);
    // TODO: Send sales to sales collection in mongo
    res.status(200).end();
  });

  app.post('/addAddress/:address', async (req, res) => {
    contractAddresses.add(req.params.address);
    res.status(200).end();
  });

  app.listen(PORT, () => {
    console.log('Server is running on port', PORT);
  });

  const signalTraps = ['SIGTERM', 'SIGINT', 'SIGUSR2'];

  signalTraps.forEach((type) => {
    process.on(type, () => {
      console.log(`process.on ${type}`);

      process.exit(0);
    });
  });
}

dbClient
  .then((_v) => {
    console.log('DB client connected');
    startServer();
  })
  .catch((reason) => {
    console.log(reason);
  });
