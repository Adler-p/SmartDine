import { Message } from 'node-nats-streaming';
import { Subjects, Listener, OrderCreatedEvent, PaymentStatus } from '@smartdine/common';
import { queueGroupName } from './queue-group-name';
import { Payment } from '../../models/payment';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    const { orderId, totalAmount, sessionId } = data;

    try {
      
      await Payment.create({
        orderId, 
        amount : totalAmount,
        paymentStatus: PaymentStatus.PENDING, 
        sessionId
      })

      msg.ack();
      console.log(`Payment record created for ${orderId}:`); 

    } catch (err) {
      console.error('Error creating payment record:', err);
      // Acknowledge to avoid infinite reprocessing
      msg.ack();
    }
  }
} 