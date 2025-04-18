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
  checkEnvVariables(['JWT_KEY', 'NATS_CLIENT_ID', 'NATS_URL', 'NATS_CLUSTER_ID']);
  
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

    // Connect to the database
    await sequelize.authenticate();
    console.log('Connected to SQL database');

    // Sync models with the database - force:true will drop tables and recreate them
    await sequelize.sync({ force: true });
    console.log('Database tables synced');
    
  } catch (err) {
    console.error('Error starting the application:', err);
    process.exit(1);
  }

  app.listen(3000, () => {
    console.log('Auth service listening on port 3000');
  });
};

start();
