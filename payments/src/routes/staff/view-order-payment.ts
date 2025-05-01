import express, { Request, Response } from 'express';
import { requireAuth, validateRequest, requireRole, UserRole } from '@smartdine/common';
import { Payment } from '../../models/payment';
import { param, body } from 'express-validator';

const router = express.Router();

router.post(
  '/api/payments/staff/:orderId',
  requireAuth,
  requireRole([UserRole.STAFF]),
  [
    body('orderId')
      .notEmpty()
      .withMessage('Order ID is required')
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { orderId } = req.body;
    console.log('orderId:', orderId);

    try{
        const payment = await Payment.findOne({ where: { orderId } });
        console.log('Payment:', payment);
        if (!payment) {
            return res.status(404).send({ error: 'Payment not found for this order ID' });
        }
        res.status(200).send(payment);
    }  catch (error) {
        console.error('Error fetching payment:', error);
        res.status(500).send({ error: 'Failed to fetch payment' });
    }
  }
);

export { router as viewOrderPaymentRouter };