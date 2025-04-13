import mongoose from 'mongoose';
import { app } from './app';
import { natsWrapper } from './nats-wrapper';
import { checkEnvVariables } from '../../common/src/utility/check-env';
import { gracefulShutdown } from '../../common/src/utility/graceful-shutdown';

import dotenv from 'dotenv';
dotenv.config();

// Set up process event handlers
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);


// Start the application
const start = async () => {
  // Check required environment variables
  checkEnvVariables(['JWT_KEY', 'MONGO_URI', 'NATS_CLIENT_ID', 'NATS_URL', 'NATS_CLUSTER_ID']);
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

  try {
    // Connect to NATS
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URL
    );

    // Handle NATS connection errors
    natsWrapper.client.on('error', (err) => {
      console.error('NATS connection error:', err);
    });
    // Graceful shutdown
    // natsWrapper.client.on('close', () => {
    //   console.log('NATS connection closed');
    //   process.exit();
    // });
    // process.on('SIGINT', () => natsWrapper.client.close());
    // process.on('SIGTERM', () => natsWrapper.client.close());

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Error starting the application:', err);
    process.exit(1);
  }

  // Start server
  app.listen(3000, () => {
    console.log('Menu service listening on port 3000');
  });
};

start(); 