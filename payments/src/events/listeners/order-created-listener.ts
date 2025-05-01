import { Message } from 'node-nats-streaming';
import { Subjects, Listener, OrderCreatedEvent, PaymentStatus } from '@smartdine/common';
import { queueGroupName } from './queue-group-name';
import { Payment } from '../../models/payment';
import { redis } from '../../redis-client';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    const { orderId, totalAmount, sessionId, tableId } = data;

    try {
      
      await Payment.create({
        orderId, 
        amount : totalAmount,
        paymentStatus: PaymentStatus.PENDING, 
        sessionId
      })

      const checkoutId = `${sessionId}_${tableId}`;

      // Store the orderId in Redis, keyed by the checkoutId
      await redis.set(`checkoutId:${checkoutId}`, JSON.stringify({ orderId }), 'EX', 24 * 60 * 60); // Example: Expire after 24 hours

      msg.ack();
      console.log(`Payment record created for ${orderId}:`); 

    } catch (err) {
      console.error('Error creating payment record:', err);
      // Acknowledge to avoid infinite reprocessing
      msg.ack();
    }
  }
} 