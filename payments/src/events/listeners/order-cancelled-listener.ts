import { Message } from 'node-nats-streaming';
import { Subjects, Listener, OrderCancelledEvent, PaymentStatus } from '@smartdine/common';
import { queueGroupName } from './queue-group-name';
import { Payment } from '../../models/payment';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
    const { orderId } = data;

    try {

      // await Payment.update(
      //   { paymentStatus: PaymentStatus.FAILED },
      //   { where: { orderId } }
      //   )

      const payment = await Payment.findOne({ where: { orderId } });
      if (!payment) {
        console.log(`Payment not found for order ${orderId}`);
        msg.ack();
        return;
      }

      payment.paymentStatus = PaymentStatus.FAILED;
      // Save with optimistic locking
      try {
        await payment.save();
        console.log(`Payment status updated to FAILED for order ${orderId}`);
        msg.ack();
      } catch (err) {
        if (err.name === 'SequelizeOptimisticLockError') {
          console.log(`Concurrency conflict: Payment ${orderId} was updated before order:cancelled event processed`); 
          msg.ack();
        } else {
          console.error('Error saving payment after order:cancelled event:', err); 
          msg.ack();
        }
      }
    } catch (err) {
      console.error('Error processing order cancelled event:', err);
      msg.ack();
    }
  }
} 