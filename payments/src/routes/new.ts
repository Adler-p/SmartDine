import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import {
  requireAuth,
  requireRole,
  UserRole,
  validateRequest,
  BadRequestError,
  NotFoundError,
  NotAuthorizedError,
  OrderStatus,
  PaymentStatus
} from '@smartdine/common';
import { Order } from '../models/order';
import { Payment } from '../models/payment';
import { PaymentCreatedPublisher } from '../events/publishers/payment-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.post(
  '/api/payments',
  requireAuth,
  [
    body('orderId')
      .not()
      .isEmpty()
      .withMessage('orderId is required'),
    body('amount')
      .isFloat({ gt: 0 })
      .withMessage('Amount must be greater than 0')
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { orderId, amount } = req.body;

    // Find the order the user is trying to pay for
    const order = await Order.findById(orderId);

    if (!order) {
      throw new NotFoundError();
    }

    // Make sure the order belongs to the user
    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    // Make sure the order can be paid for
    if (order.status === OrderStatus.Cancelled) {
      throw new BadRequestError('Cannot pay for a cancelled order');
    }

    // Create the payment
    const payment = Payment.build({
      orderId,
      amount,
      status: PaymentStatus.Created,
      userId: req.currentUser!.id
    });
    await payment.save();

    // Publish payment created event
    await new PaymentCreatedPublisher(natsWrapper.client).publish({
      id: payment.id,
      orderId: payment.orderId,
      amount: payment.amount,
      status: payment.status,
      userId: payment.userId,
      version: payment.version
    });

    res.status(201).send(payment);
  }
);

export { router as createPaymentRouter }; 