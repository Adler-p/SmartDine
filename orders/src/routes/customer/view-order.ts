import express, { Request, Response } from 'express';
import { validateRequest, validateSession } from '@smartdine/common';
import { param } from 'express-validator';
import { Order, OrderItem } from '../../sequelize';
import { redis } from '../../redis-client';

const router = express.Router();

router.get(
  '/api/orders/:orderId',
  [
    param('orderId')
      .isUUID()
      .withMessage('Order ID must be a valid UUID'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { orderId } = req.params;
    
    // 处理会话ID
    let sessionId;
    
    // 尝试从validateSession中间件获取
    if (req.sessionData && req.sessionData.sessionId) {
      sessionId = req.sessionData.sessionId;
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
      const order = await Order.findOne({
        where: { orderId },
        include: [{ model: OrderItem, as: 'orderItems' }],
      });

      if (!order) {
        return res.status(404).send({ errors: [{ message: 'Order not found' }] });
      }

      // 检查订单是否属于当前用户（确认购物车的客户）
      if (order.sessionId !== sessionId) {
        return res.status(403).send({ errors: [{ message: 'Not authorized to view this order' }] });
      }

      res.status(200).send(order);

    } catch (error) {
      console.error('Error fetching order:', error);
      res.status(500).send({ errors: [{ message: 'Failed to fetch order' }] });
    }
  }
);

export { router as showOrderRouter };