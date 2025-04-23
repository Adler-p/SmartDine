import { natsWrapper } from '../class/nats-wrapper';

// Graceful shutdown handler
export const gracefulShutdown = async (dbConnection?: any) => {
    console.log('Received shutdown signal. Starting graceful shutdown...');
    
    try {
      // Close NATS connection
      natsWrapper.client.on('close', () => {
        console.log('NATS connection closed');
      });
      natsWrapper.client.close();
  
      // Close database connection if provided
      if (dbConnection) {
        if (typeof dbConnection.close === 'function') {
          await dbConnection.close();
        } else if (typeof dbConnection.connection?.close === 'function') {
          await dbConnection.connection.close();
        }
        console.log('Database connection closed');
      }
  
      // Exit process
      process.exit(0);
    } catch (err) {
      console.error('Error during graceful shutdown:', err);
      process.exit(1);
    }
  };