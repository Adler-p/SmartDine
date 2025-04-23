import { Message } from 'node-nats-streaming';
import { Listener, PaymentCreatedEvent, OrderStatus, Subjects } from '@smartdine/common';
import { queueGroupName } from './queue-group-name';
import { Order } from '../../sequelize';

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: PaymentCreatedEvent['data'], msg: Message) {
    const order = await Order.findOne({
      where: { orderId: data.orderId }
    });

    if (!order) {
      console.log(`Order not found for ID: ${data.orderId}`);
      msg.ack();
      return;
    }

    //! Doesn't make sense for order status to be 'COMPLETED' immediately after payment has been created (Creation of payment does not mean payment has been successful). Also, what about the other order statuses? (AWAITING_PREPARATION, IN_PREPARATION etc). 
    // Update order status to complete
    // order.orderStatus = OrderStatus.COMPLETED;
    // await order.save();

    msg.ack();
  }
} 