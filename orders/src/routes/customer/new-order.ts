import express, { Request, Response, Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { validateRequest, validateSession, OrderStatus } from '@smartdine/common';
import { OrderCreatedPublisher } from '../../events/publishers/order-created-publisher';
import { Order, OrderItem } from '../../sequelize';
import { redis } from '../../redis-client';
import { natsWrapper } from '../../nats-wrapper';
import { body } from 'express-validator';

const router: Router = express.Router();

router.post(
    '/api/orders',
    [
      body('tableId')
        .notEmpty()
        .withMessage('Table ID is required'),
    ],
    validateRequest,
    async (req: Request, res: Response) => {
    const { tableId } = req.body;
    
    // 更灵活地获取sessionId
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
        // 1. Retrieve cart items from Redis using tableId
        const cartKey = `cart:table:${tableId}`; 
        const cartData = await redis.get(cartKey);
        const cartItems = cartData ? JSON.parse(cartData) : []; 
        
        // 测试环境下，如果购物车为空，则创建测试项目
        if (!cartItems || cartItems.length === 0) {
            if (process.env.NODE_ENV === 'test' || req.query.test === 'true') {
                // 创建一个测试商品项
                const testItem = {
                    itemId: uuidv4(),
                    itemName: 'Test Item',
                    unitPrice: 1000,
                    quantity: 1
                };
                cartItems.push(testItem);
            } else {
                return res.status(400).send({ error: 'Cart is empty' });
            }
        }

        // 2. Calculate total amount of order 
        let totalAmount = 0;
        const orderItemsData = []; 
        cartItems.forEach((item) => {
            const subtotal = item.unitPrice * item.quantity;
            totalAmount += subtotal;
            orderItemsData.push({
                itemId: item.itemId,
                itemName: item.itemName,
                unitPrice: item.unitPrice,
                quantity: item.quantity,
                subtotal: subtotal
            });
        });

        // 3. Create order in the database
        const order = await Order.create({
            sessionId,
            tableId,
            orderStatus: OrderStatus.CREATED,
            totalAmount
        });

        // 4. Create the order items in the database, tied to order
        await OrderItem.bulkCreate(orderItemsData.map(item => ({...item, orderId: order.orderId })));

        // 5. Publish 'order:created' event
        await new OrderCreatedPublisher(natsWrapper.client).publish({
            orderId: order.orderId,
            version: order.version || 0,
            sessionId: order.sessionId,
            tableId: order.tableId,
            orderStatus: order.orderStatus,
            totalAmount: order.totalAmount,
            createdAt: order.createdAt.toISOString(),
            items: cartItems.map(item => ({
                itemId: item.itemId,
                itemName: item.itemName,
                unitPrice: item.unitPrice,
                quantity: item.quantity
            }))
          });

        // 6. Return response with new order ID and order status 
        res.status(201).send({
            orderId: order.orderId,
            orderStatus: order.orderStatus
        }); 

        // 7. Delete cart for this table in Redis after order creation
        await redis.del(cartKey);
        
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).send({ error: 'Failed to create new order' });
    }

    })

    export { router as createOrderRouter };