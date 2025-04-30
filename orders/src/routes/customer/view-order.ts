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

    // 修改逻辑以优先获取用户 ID
    let userIdForLookup: string | undefined; // Rename for clarity
    
    // 优先尝试从当前用户获取用户 ID (应该是 UUID)
    if (req.currentUser && req.currentUser.id) {
      userIdForLookup = req.currentUser.id;
    } 
    // 如果没有当前用户，再尝试从 validateSession 中间件获取（如果适用）
    else if (req.sessionData && req.sessionData.sessionId) {
        // 注意：这里假设 validateSession 返回的是用户ID 或符合 sessionId 列类型的 ID
        userIdForLookup = req.sessionData.sessionId;
    } 
    // 再次检查 cookie 中的 session 值，但不直接用它作为 ID
    // else if (req.cookies && req.cookies.session) {
      // 不应直接使用 JWT 作为 sessionId
      // sessionId = req.cookies.session; 
    // }
    
    // 没有有效的用户ID则返回错误
    if (!userIdForLookup) {
      // Log details for debugging why no ID was found
      console.error('Failed to determine user/session ID for viewing order.', {
          currentUser: req.currentUser,
          sessionData: req.sessionData,
          cookies: req.cookies
      });
      return res.status(400).send({ error: 'User ID or Session ID is required and could not be determined.' });
    }

    try {
      const order = await Order.findOne({
        where: { orderId },
        include: [{ model: OrderItem, as: 'orderItems' }],
      });

      if (!order) {
        return res.status(404).send({ errors: [{ message: 'Order not found' }] });
      }

      // 检查订单是否属于当前用户（使用正确的 ID 进行比较）
      if (order.sessionId !== userIdForLookup) {
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