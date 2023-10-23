import express from 'express';

const createServer = () => {
  const app = express();

  app.use(express.json());
  app.use(express.static('public'));

  return app;
};

export { createServer };
