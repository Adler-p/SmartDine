// import mongoose from 'mongoose';
import { app } from './app';
import { natsWrapper } from './nats-wrapper';

import dotenv from 'dotenv';

import { SessionCreatedListener } from './events/listeners/session-created-listener';

dotenv.config();

const start = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error('JWT_KEY must be defined');
  }
  // if (!process.env.SQL_URI) {
  //   throw new Error('SQL_URI must be defined');
  // }
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
    // // 首先连接到数据库
    // await sequelize.authenticate();
    // console.log('Connected to PostgreSQL database');

    // // 同步数据库模型 (强制重建表)
    // await sequelize.sync({ force: true });
    // console.log('Database tables recreated and synced');

    // 连接到NATS
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

    // Start listening for session:created events
    new SessionCreatedListener(natsWrapper.client).listen();

  } catch (err) {
    console.error('Error starting service:', err);
  }
  app.get('/health', (req, res) => {
    res.status(200).send('OK');
  });
  app.listen(3000, () => {
    console.log('Listening on port 3000!');
  });
};

start(); 