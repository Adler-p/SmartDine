import express, { Request, Response, Router } from 'express';
import {
  requireAuth,
  NotFoundError,
  NotAuthorizedError,
  OrderStatus,
  requireRole,
  UserRole
} from '@smartdine/common';
import { Order } from '../models/order';
import { OrderCancelledPublisher } from '../events/publishers/order-cancelled-publisher';
import { natsWrapper } from '../nats-wrapper';

const router: Router = express.Router();

router.delete(
  '/api/orders/:orderId',
  requireAuth,
  requireRole([UserRole.CUSTOMER]),
  async (req: Request, res: Response) => {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
      throw new NotFoundError();
    }

    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    order.status = OrderStatus.Cancelled;
    await order.save();

    // Publish an event saying this was cancelled!
    new OrderCancelledPublisher(natsWrapper.client).publish({
      id: order.id,
      version: order.version,
      items: order.items.map(item => ({
        menuItemId: item.menuItemId,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      }))
    });

    res.status(204).send(order);
  }
);

export { router as deleteOrderRouter };
