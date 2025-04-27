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
    
    // 灵活处理会话ID，支持多种方式获取
    let sessionId = req.sessionData?.sessionId;
    
    // 如果没有通过validateSession中间件获取会话，尝试从cookies或query中获取
    if (!sessionId) {
      sessionId = req.cookies?.session || req.query.sessionId as string;
    }
    
    // 如果仍然没有sessionId，根据jwt中的userId创建一个
    if (!sessionId && req.currentUser?.id) {
      sessionId = req.currentUser.id;
    }
    
    // 如果还是没有sessionId，生成一个新的
    if (!sessionId) {
      sessionId = uuidv4();
    }
    
    const userId = req.currentUser?.id;

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