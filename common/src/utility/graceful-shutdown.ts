import { natsWrapper } from '../class/nats-wrapper';
import mongoose from 'mongoose';

// Graceful shutdown handler
export const gracefulShutdown = async () => {
    console.log('Received shutdown signal. Starting graceful shutdown...');
    
    try {
      // Close NATS connection
      natsWrapper.client.on('close', () => {
        console.log('NATS connection closed');
      });
      natsWrapper.client.close();
  
      // Close MongoDB connection
      await mongoose.connection.close();
      console.log('MongoDB connection closed');
  
      // Exit process
      process.exit(0);
    } catch (err) {
      console.error('Error during graceful shutdown:', err);
      process.exit(1);
    }
  };