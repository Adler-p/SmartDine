// import mongoose from 'mongoose';
import { app } from './app';
import { natsWrapper } from './nats-wrapper';
import { ExpirationCompleteListener } from './events/listeners/expiration-complete-listener';
import { PaymentCreatedListener } from './events/listeners/payment-created-listener';
import { sequelize } from './sequelize';
import { checkAndCancelExpiredOrders } from './services/check-expired-orders';
import { PaymentUpdatedListener } from './events/listeners/payment-updated-listener';
import dotenv from 'dotenv';

dotenv.config();

const start = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error('JWT_KEY must be defined');
  }
  if (!process.env.SQL_URI) {
    throw new Error('SQL_URI must be defined');
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
    // 首先连接到数据库
    await sequelize.authenticate();
    console.log('Connected to PostgreSQL database');

    // 同步数据库模型 (强制重建表)
    await sequelize.sync({ force: true });
    console.log('Database tables recreated and synced');

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

    // 启动所有事件监听器
    new ExpirationCompleteListener(natsWrapper.client).listen();
    new PaymentCreatedListener(natsWrapper.client).listen();
    new PaymentUpdatedListener(natsWrapper.client).listen();

    // 设置定时检查过期订单的任务
    setInterval(checkAndCancelExpiredOrders, 60 * 1000);

  } catch (err) {
    console.error('Error starting service:', err);
  }

  app.listen(3000, () => {
    console.log('Listening on port 3000!');
  });
};

start(); 