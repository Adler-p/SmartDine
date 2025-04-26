import express, { Request, Response, Router } from 'express';
import { body } from 'express-validator';
import { PaymentStatus, validateRequest } from '@smartdine/common';
import { Payment } from '../../models/payment';
import { natsWrapper } from '../../nats-wrapper';
import { PaymentCreatedPublisher } from '../../events/publishers/payment-created-publisher';
import { v4 as uuidv4 } from 'uuid';
import { redis } from '../../redis-client';

const router: Router = express.Router();

router.post(
  '/api/payments',
  [
    body('orderId')
      .notEmpty()
      .isUUID()
      .withMessage('Order ID is required and must be a valid UUID'),
    body('amount')
      .isFloat({ gt: 0 })
      .withMessage('Amount must be greater than 0'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { orderId, amount } = req.body;
   
   // 处理会话ID
   let sessionId;
    
   // 尝试从validateSession中间件获取
   if (req.session && req.session.sessionId) {
     sessionId = req.session.sessionId;
   } 
   // 尝试从cookie或req.currentUser获取
   else if (req.cookies && req.cookies.session) {
     sessionId = req.cookies.session;
   } 
   // 尝试从当前用户获取
   else if (req.currentUser && req.currentUser.id) {
     sessionId = req.currentUser.id;
   }
   
   // 没有sessionId则返回错误
   if (!sessionId) {
     return res.status(400).send({ error: 'Session ID is required' });
   }

    try {
      // Create a payment record
      const payment = await Payment.create({
        orderId,
        amount,
        paymentStatus: PaymentStatus.PENDING,
        sessionId,
        paymentMethod: 'credit_card', // Default payment method
      });

      // Publish payment:created event
      await new PaymentCreatedPublisher(natsWrapper.client).publish({
        paymentId: payment.paymentId,
        orderId: payment.orderId,
        amount: payment.amount,
        paymentStatus: payment.paymentStatus,
        version: payment.version || 0
      });

      res.status(201).send({
        id: payment.paymentId,
        orderId: payment.orderId,
        amount: payment.amount,
        status: payment.paymentStatus
      });

    } catch (error) {
      console.error('Error creating payment:', error);
      res.status(500).send({ error: 'Failed to create payment' });
    }
  }
);

export { router as createPaymentRouter }; 