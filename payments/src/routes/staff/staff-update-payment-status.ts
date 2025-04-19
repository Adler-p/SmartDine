import express, { Request, Response, Router } from 'express';
import { body } from 'express-validator';
import { PaymentStatus, requireAuth, validateRequest, requireRole, UserRole } from '@smartdine/common';
import { Payment } from '../../models/payment';
import { natsWrapper } from '../../nats-wrapper';
import { PaymentUpdatedPublisher } from '../../events/publishers/payment-updated-publisher';


const router: Router = express.Router();

router.post(
  '/api/payments/staff/update-status',
    requireAuth,
    requireRole([UserRole.STAFF]),
  [
    body('orderId')
      .notEmpty()
      .isUUID()
      .withMessage('Order ID is required'),
    body('paymentStatus')
      .isIn(Object.values(PaymentStatus))
      .withMessage('Must be a valid payment status')
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { orderId, paymentStatus } = req.body;

    try {
      const payment = await Payment.findOne({ where: { orderId } });

      if (!payment) {
        return res.status(404).send({ error: 'Payment record not found' });
      }

      payment.paymentStatus = paymentStatus;

      // Save with optimistic locking
      try {
        await payment.save();
        console.log(`Payment status updated for order ${orderId}`);
      } catch (err) {
        if (err.name === 'SequelizeOptimisticLockError') {
          console.log(`Concurrency conflict: Payment ${orderId} was updated before, please refresh`); 
        } else {
          console.error('Error saving payment after payment status update:', err); 
        }
      }

      // Publish payment:updated event
      await new PaymentUpdatedPublisher(natsWrapper.client).publish({
        paymentId: payment.paymentId,
        orderId: payment.orderId,
        amount: payment.amount,
        paymentStatus: paymentStatus,
        version: payment.version
      })

      res.status(200).send({ message: 'Payment status updated successfully' });

    } catch (error) {
        console.error('Error updating payment status:', error);
        res.status(500).send({ error: 'Failed to update payment status' });
    }
    
  }
);
export { router as staffUpdatePaymentStatusRouter };