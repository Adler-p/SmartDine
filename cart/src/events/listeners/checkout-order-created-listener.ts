import { Message } from 'node-nats-streaming';
import { Subjects, Listener, OrderCreatedEvent, PaymentStatus } from '@smartdine/common';
import { queueGroupName } from './queue-group-name';

const orderIdPromises: { [key: string]: (orderId: string) => void } = {};

export class CheckoutOrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    const { orderId, sessionId, tableId } = data;
    const checkoutId = `${sessionId}_${tableId}`;

    try {
      
        if (orderIdPromises[checkoutId]) {
            orderIdPromises[checkoutId](orderId);
            delete orderIdPromises[checkoutId];
        }

      msg.ack();
      console.log(`OrderId retrieved for cart checkout: ${orderId}:`); 

    } catch (err) {
      console.error('Error retrieving orderId after order creation:', err);
      msg.ack();
    }
  }
} 