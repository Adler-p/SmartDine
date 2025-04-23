import express, { Request, Response } from 'express';
import { currentUser, requireAuth, validateRequest, UserRole, requireRole, OrderStatus } from '@smartdine/common';
import { param, body } from 'express-validator';
import { Order } from '../../sequelize';
import { OrderCancelledPublisher } from '../../events/publishers/order-cancelled-publisher';
import { natsWrapper } from '../../nats-wrapper';

const router = express.Router();

// 路由同时支持PUT和PATCH方法
router.put(
  '/api/orders/:orderId/status',
  [
    param('orderId')
      .isUUID()
      .withMessage('Order ID must be a valid UUID'),
    body('status')
      .isIn(Object.values(OrderStatus))
      .withMessage('Invalid order status'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { orderId } = req.params;
    const { status } = req.body;
    
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
        where: { orderId }
      });

      if (!order) {
        return res.status(404).send({ errors: [{ message: 'Not Found' }] });
      }

      // 更新订单状态
      order.orderStatus = status;
      await order.save();

      // 获取更新后的订单信息
      const updatedOrder = await Order.findOne({
        where: { orderId }
      });
      
      res.status(200).send(updatedOrder);

      // 对于已取消订单发布事件
      if (status === OrderStatus.CANCELLED) {
        await new OrderCancelledPublisher(natsWrapper.client).publish({ 
          orderId: order.orderId 
        });
      } 

    } catch (error) {
      console.error('Error updating order status:', error);
      res.status(500).send({ errors: [{ message: 'Failed to update order status' }] });
    }
  }
);

export { router as updateOrderStatusRouter };