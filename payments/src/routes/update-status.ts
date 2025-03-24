import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import {
  requireAuth,
  requireRole,
  UserRole,
  validateRequest,
  NotFoundError,
  BadRequestError,
  PaymentStatus
} from '@smartdine/common';
import { Payment } from '../models/payment';
import { PaymentUpdatedPublisher } from '../events/publishers/payment-updated-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

// Define valid status transitions
const validTransitions = {
  [PaymentStatus.Created]: [PaymentStatus.Pending, PaymentStatus.Failed],
  [PaymentStatus.Pending]: [PaymentStatus.Completed, PaymentStatus.Failed],
  [PaymentStatus.Completed]: [PaymentStatus.Refunded],
  [PaymentStatus.Failed]: [],
  [PaymentStatus.Refunded]: []
};

router.put(
  '/api/payments/:id/status',
  requireAuth,
  requireRole([UserRole.STAFF]),
  [
    body('status')
      .isIn(Object.values(PaymentStatus))
      .withMessage('Status must be a valid payment status')
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;

    // Find payment by ID
    const payment = await Payment.findById(id);
    
    if (!payment) {
      throw new NotFoundError();
    }
    
    // Check if the status transition is valid
    if (!validTransitions[payment.status]?.includes(status)) {
      return res.status(400).send({ 
        errors: [{ message: `Cannot transition from ${payment.status} to ${status}` }] 
      });
    }
    
    // Update payment status
    payment.status = status;
    await payment.save();
    
    // Publish payment updated event
    await new PaymentUpdatedPublisher(natsWrapper.client).publish({
      id: payment.id,
      orderId: payment.orderId,
      status: payment.status,
      amount: payment.amount,
      userId: payment.userId,
      version: payment.version
    });
    
    res.status(200).send(payment);
  }
);

export { router as updatePaymentStatusRouter }; 