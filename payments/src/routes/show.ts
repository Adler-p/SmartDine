import express, { Request, Response } from 'express';
import { NotFoundError, NotAuthorizedError, requireAuth } from '@smartdine/common';
import { Payment } from '../models/payment';

const router = express.Router();

router.get(
  '/api/payments/:id',
  requireAuth,
  async (req: Request, res: Response) => {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      throw new NotFoundError();
    }

    if (payment.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    res.send(payment);
  }
);

export { router as showPaymentRouter }; 