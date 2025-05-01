import { Message } from 'node-nats-streaming';
import { Subjects, Listener, OrderCreatedEvent, PaymentStatus } from '@smartdine/common';
import { queueGroupName } from './queue-group-name';
import { Payment } from '../../models/payment';
import { redis } from '../../redis-client';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    console.log('Order created listener executed!');
    const { orderId, totalAmount, sessionId, tableId } = data;
    console.log('Order created data:', {
      orderId,
      totalAmount,
      sessionId,
      tableId
    });

    try {
      
      await Payment.create({
        orderId, 
        amount : totalAmount,
        paymentStatus: PaymentStatus.PENDING, 
        sessionId
      })

      console.log('Payment record created:', {
        orderId,
        tableId,
        sessionId
      });

      const checkoutId = `${sessionId}_${tableId}`;

      // Store the orderId in Redis, keyed by the checkoutId
      await redis.set(`checkoutId:${checkoutId}`, JSON.stringify({ orderId }), 'EX', 24 * 60 * 60); // Example: Expire after 24 hours

      const redisData = await redis.get(`checkoutId:${checkoutId}`);
            console.log('Redis data for checkoutId inside order-created-listener:', {checkoutId,redisData});

      msg.ack();
      console.log(`Payment record created for ${orderId}:`); 

    } catch (err) {
      console.error('Error creating payment record:', err);
      // Acknowledge to avoid infinite reprocessing
      msg.ack();
    }
  }
} 