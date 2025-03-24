import express, { Request, Response, Router } from 'express';
import { NotFoundError, requireAuth, requireRole, UserRole, validateRequest, OrderStatus } from '@smartdine/common';
import { body } from 'express-validator';
import { Order } from '../../models/order';
import { natsWrapper } from '../../nats-wrapper';
import { OrderCreatedPublisher } from '../../events/publishers/order-created-publisher';

const router: Router = express.Router();

// Define valid status transitions
const validTransitions = {
  [OrderStatus.Created]: [OrderStatus.AwaitingPreparation, OrderStatus.Cancelled],
  [OrderStatus.AwaitingPreparation]: [OrderStatus.InPreparation, OrderStatus.Cancelled],
  [OrderStatus.InPreparation]: [OrderStatus.Ready, OrderStatus.Cancelled],
  [OrderStatus.Ready]: [OrderStatus.Completed, OrderStatus.Cancelled],
  [OrderStatus.Completed]: [],
  [OrderStatus.Cancelled]: []
};

router.put(
  '/api/orders/:orderId/status',
  requireAuth,
  requireRole([UserRole.STAFF]),
  [
    body('status')
      .isIn(Object.values(OrderStatus))
      .withMessage('Status must be a valid order status')
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { orderId } = req.params;
    const { status } = req.body;

    // Find order by ID
    const order = await Order.findById(orderId);
    
    if (!order) {
      throw new NotFoundError();
    }
    
    // Check if the status transition is valid
    if (!validTransitions[order.status]?.includes(status)) {
      return res.status(400).send({ 
        errors: [{ message: `Cannot transition from ${order.status} to ${status}` }] 
      });
    }
    
    // Update order status
    order.status = status;
    await order.save();
    
    // Publish order updated event
    await new OrderCreatedPublisher(natsWrapper.client).publish({
      id: order.id,
      version: order.version,
      status: order.status,
      userId: order.userId,
      expiresAt: order.expiresAt.toISOString(),
      items: order.items.map(item => ({
        menuItemId: item.menuItemId,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      }))
    });
    
    res.status(200).send(order);
  }
);

export { router as updateOrderStatusRouter }; 