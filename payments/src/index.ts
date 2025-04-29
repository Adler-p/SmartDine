import { app } from './app';
import { natsWrapper } from './nats-wrapper';
import { OrderCreatedListener } from './events/listeners/order-created-listener';
import { OrderCancelledListener } from './events/listeners/order-cancelled-listener';
import { sequelize } from './sequelize';

import dotenv from 'dotenv';
dotenv.config();

const start = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error('JWT_KEY must be defined');
  }
  if (!process.env.NATS_CLIENT_ID) {
    throw new Error('NATS_CLIENT_ID must be defined');
  }
  if (!process.env.NATS_URL) {
    throw new Error('NATS_URL must be defined');
  }
  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error('NATS_CLUSTER_ID must be defined');
  }

  try {
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URL
    );
    natsWrapper.client.on('close', () => {
      console.log('NATS connection closed!');
      process.exit();
    });
    process.on('SIGINT', () => natsWrapper.client.close());
    process.on('SIGTERM', () => natsWrapper.client.close());    

    // Connect to PostgreSQL database
    await sequelize.authenticate();
    console.log('Connected to PostgreSQL database');

    // Sync database schema
    await sequelize.sync();
    console.log('Database schema synchronized');

    // Start listening for events
    new OrderCreatedListener(natsWrapper.client).listen();
    new OrderCancelledListener(natsWrapper.client).listen();
    
  } catch (err) {
    console.error(err);
  }
  app.get('/health', (req, res) => {
    res.status(200).send('OK');
  });
  app.listen(3000, () => {
    console.log('Listening on port 3000!');
  });
};

start(); 