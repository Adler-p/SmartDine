import express, { Request, Response, Router } from 'express';
import { NotFoundError } from '@smartdine/common';
import { Payment } from '../../models/payment';
import { redis } from '../../redis-client';

const router: Router = express.Router();

router.get(
  '/api/payments/:id',
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const payment = await Payment.findOne({ where: { paymentId: id } });

      if (!payment) {
        throw new NotFoundError();
      }

      res.status(200).send({
        id: payment.paymentId,
        orderId: payment.orderId,
        amount: payment.amount,
        status: payment.paymentStatus,
        createdAt: payment.createdAt
      });
    } catch (error) {
      console.error('Error fetching payment:', error);
      if (error instanceof NotFoundError) {
        throw error;
      }
      res.status(500).send({ error: 'Failed to fetch payment details' });
    }
  }
);

export { router as getPaymentRouter }; 