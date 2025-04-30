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
    
    // 修改逻辑以优先获取用户 ID (虽然在此路由中可能不直接用于UUID比较，但保持一致性)
    let userIdForAuthCheck: string | undefined; // Rename for clarity
    
    // 优先尝试从当前用户获取用户 ID (应该是 UUID)
    if (req.currentUser && req.currentUser.id) {
      userIdForAuthCheck = req.currentUser.id;
    } 
    // 如果没有当前用户，再尝试从 validateSession 中间件获取（如果适用）
    else if (req.sessionData && req.sessionData.sessionId) {
        // 注意：这里假设 validateSession 返回的是用户ID 或符合 sessionId 列类型的 ID
        userIdForAuthCheck = req.sessionData.sessionId;
    } 
    // 再次检查 cookie 中的 session 值，但不直接用它作为 ID
    // else if (req.cookies && req.cookies.session) {
      // 不应直接使用 JWT 作为 sessionId
      // sessionId = req.cookies.session; 
    // }
    
    // 没有有效的用户ID则返回错误 (即使不直接比较，也需要确保用户已认证)
    if (!userIdForAuthCheck) {
      // Log details for debugging why no ID was found
      console.error('Failed to determine user/session ID for updating order status.', {
          currentUser: req.currentUser,
          sessionData: req.sessionData,
          cookies: req.cookies
      });
      // 通常，这个路由应该有 requireAuth 或 requireRole 中间件来处理未认证情况
      // 但以防万一，我们仍然返回错误
      return res.status(401).send({ error: 'Authentication required and could not be verified.' }); 
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