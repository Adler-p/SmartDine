import mongoose from 'mongoose';
import { app } from './app';
import { natsWrapper } from './nats-wrapper';
import { checkEnvVariables, gracefulShutdown } from '@smartdine/common';
import { sequelize } from './sequelize';

import dotenv from 'dotenv';
dotenv.config({ path: __dirname + '/../.env' });
console.log('Loaded environment variables:', process.env);

// Set up process event handlers
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

const start = async () => {
  // Check required environment variables
  checkEnvVariables(['JWT_KEY', 'POSTGRES_URI', 'NATS_CLIENT_ID', 'NATS_URL', 'NATS_CLUSTER_ID']);
  // if (!process.env.JWT_KEY) {
  //   throw new Error('JWT_KEY must be defined');
  // }
  // if (!process.env.MONGO_URI) {
  //   throw new Error('MONGO_URI must be defined');
  // }
  // if (!process.env.NATS_CLIENT_ID) {
  //   throw new Error('NATS_CLIENT_ID must be defined');
  // }
  // if (!process.env.NATS_URL) {
  //   throw new Error('NATS_URL must be defined');
  // }
  // if (!process.env.NATS_CLUSTER_ID) {
  //   throw new Error('NATS_CLUSTER_ID must be defined');
  // }

  console.log('POSTGRES_URI inside index.ts:', process.env.POSTGRES_URI);

  if (!process.env.POSTGRES_URI) {
    throw new Error('POSTGRES_URI is not defined');
  }

  try {
    // Connect to NATS
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID!,
      process.env.NATS_CLIENT_ID!,
      process.env.NATS_URL!
    );

    // Handle NATS connection errors
    natsWrapper.client.on('error', (err) => {
      console.error('NATS connection error:', err);
    });

    // natsWrapper.client.on('close', () => {
    //   console.log('NATS connection closed!');
    //   process.exit();
    // });
    // process.on('SIGINT', () => natsWrapper.client.close());
    // process.on('SIGTERM', () => natsWrapper.client.close());

    // await mongoose.connect(process.env.MONGO_URI!);
    // console.log('Connected to MongoDB');

    // Connect to the database
    await sequelize.authenticate();
    console.log('Connected to SQL database');

    // Sync models with the database
    await sequelize.sync();
    
  } catch (err) {
    console.error('Error starting the application:', err);
    process.exit(1);
  }

  app.listen(3000, () => {
    console.log('Auth service listening on port 3000');
  });
};

start();
