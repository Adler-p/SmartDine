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
   
   // 修改逻辑以优先获取用户 ID
   let userIdForPayment: string | undefined; // Rename for clarity
    
   // 优先尝试从当前用户获取用户 ID (应该是 UUID)
   if (req.currentUser && req.currentUser.id) {
     userIdForPayment = req.currentUser.id;
   } 
   // 如果没有当前用户，再尝试从 validateSession 中间件获取（如果适用）
   else if (req.sessionData && req.sessionData.sessionId) {
       // 注意：这里假设 validateSession 返回的是用户ID 或符合 sessionId 列类型的 ID
       userIdForPayment = req.sessionData.sessionId;
   } 
   // 再次检查 cookie 中的 session 值，但不直接用它作为 ID
   // else if (req.cookies && req.cookies.session) {
     // 不应直接使用 JWT 作为 sessionId
     // sessionId = req.cookies.session; 
   // }
   
   // 没有有效的用户ID则返回错误
   if (!userIdForPayment) {
     // Log details for debugging why no ID was found
     console.error('Failed to determine user/session ID for payment creation.', {
         currentUser: req.currentUser,
         sessionData: req.sessionData,
         cookies: req.cookies
     });
     return res.status(400).send({ error: 'User ID or Session ID is required and could not be determined.' });
   }

    try {
      // Create a payment record using the correct ID
      const payment = await Payment.create({
        orderId,
        amount,
        paymentStatus: PaymentStatus.PENDING,
        sessionId: userIdForPayment, // Use the correct ID here
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