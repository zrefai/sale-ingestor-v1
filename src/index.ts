import { createServer } from '../config/express.js';

const PORT = 3000;

async function startServer() {
  const app = createServer();

  app.get('/ping', (_req, res) => {
    return res.send('pong');
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

startServer();
