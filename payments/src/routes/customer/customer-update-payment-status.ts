import express, { Request, Response, Router } from 'express';
import { body } from 'express-validator';
import { PaymentStatus, validateRequest } from '@smartdine/common';
import { Payment } from '../../models/payment';
import { natsWrapper } from '../../nats-wrapper';
import { PaymentUpdatedPublisher } from '../../events/publishers/payment-updated-publisher'; 

const router: Router = express.Router();

router.post(
  '/api/payments/update-status',
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
    // const sessionId = req.session.sessionId; // Old logic

    // 修改逻辑以优先获取用户 ID
    let userIdForLookup: string | undefined; // Rename for clarity
    
    // 优先尝试从当前用户获取用户 ID (应该是 UUID)
    if (req.currentUser && req.currentUser.id) {
      userIdForLookup = req.currentUser.id;
    } 
    // 如果没有当前用户，再尝试从 validateSession 中间件获取（如果适用 - 保留以防万一，但优先currentUser）
    else if (req.sessionData && req.sessionData.sessionId) {
        userIdForLookup = req.sessionData.sessionId;
    } 
    
    // 没有有效的用户ID则返回错误
    if (!userIdForLookup) {
      console.error('Failed to determine user/session ID for updating payment status.', { currentUser: req.currentUser, sessionData: req.sessionData });
      return res.status(401).send({ error: 'Authentication required and could not be verified.' });
    }

    try {
      const payment = await Payment.findOne({ where: { orderId } });

      if (!payment) {
        return res.status(404).send({ error: 'Payment record not found' });
      }

      // Check if sessionId matches the payment record (using the correct ID)
      if (userIdForLookup !== payment.sessionId) {
        return res.status(403).send({ error: 'User ID does not match payment record' });
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
export { router as customerUpdatePaymentStatusRouter };