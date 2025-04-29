import mongoose from 'mongoose';
import { app } from './app';
import { natsWrapper } from './nats-wrapper';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

// Set up process event handlers
const gracefulShutdown = () => {
  console.log('SIGTERM/SIGINT received, shutting down gracefully');
  try {
    if (natsWrapper && natsWrapper.client) {
      natsWrapper.client.close();
      console.log('NATS connection closed');
    }
  } catch (err) {
    console.error('Error during shutdown:', err);
  }
  process.exit(0);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Unhandled promise rejection handler
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

// Start the application
const start = async () => {
  console.log('Starting menu service...');
  
  // Check required environment variables
  const requiredEnvVars = ['JWT_KEY', 'MONGO_URI', 'NATS_CLIENT_ID', 'NATS_URL', 'NATS_CLUSTER_ID'];
  const missingVars = [];
  
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missingVars.push(envVar);
    }
  }
  
  if (missingVars.length > 0) {
    console.error(`Missing required environment variables: ${missingVars.join(', ')}`);
    throw new Error(`Required environment variables not defined: ${missingVars.join(', ')}`);
  }

  try {
    // Connect to NATS with timeout
    console.log(`Connecting to NATS at ${process.env.NATS_URL}...`);
    const natsTimeout = setTimeout(() => {
      console.error('NATS connection timeout - proceeding without event publishing');
    }, 5000);
    
    try {
      await natsWrapper.connect(
        process.env.NATS_CLUSTER_ID!,
        process.env.NATS_CLIENT_ID!,
        process.env.NATS_URL!
      );
      clearTimeout(natsTimeout);
      console.log('Successfully connected to NATS');
    } catch (natsError) {
      console.error('Failed to connect to NATS:', natsError);
      console.log('Continuing without event publishing');
    }

    // Connect to MongoDB
    console.log(`Connecting to MongoDB at ${process.env.MONGO_URI}...`);
    await mongoose.connect(process.env.MONGO_URI!,{
      ssl: true,
      sslCA: '/app/menu//global-bundle.pem',
    });
    console.log('Successfully connected to MongoDB');
  } catch (err) {
    console.error('Error during service initialization:', err);
    throw err;
  }
  app.get('/health', (req, res) => {
    res.status(200).send('OK');
  });
  // Start server
  app.listen(3000,'0.0.0.0', () => {
    console.log('Menu service listening on port 3000');
  });
};

// Execute startup function and handle errors
start().catch(err => {
  console.error('Failed to start menu service:', err);
  process.exit(1);
}); 