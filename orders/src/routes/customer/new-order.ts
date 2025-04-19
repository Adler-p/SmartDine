import express, { Request, Response, Router } from 'express';
// import { v4 as uuidv4 } from 'uuid';
import { validateRequest, validateSession, OrderStatus } from '@smartdine/common';
import { OrderCreatedPublisher } from '../../events/publishers/order-created-publisher';
import { Order } from '../../models/order';
import { OrderItem } from '../../models/orderItem';
import { redis } from '../../redis-client';
import { natsWrapper } from '../../nats-wrapper';
import { body } from 'express-validator';

const router: Router = express.Router();

router.post(
    '/api/orders',
    validateSession(redis), 
    [
      body('tableId')
        .notEmpty()
        .withMessage('Table ID is required'),
    ],
    validateRequest,
    async (req: Request, res: Response) => {
    const { tableId } = req.body;
    const cartConfirmingSessionId = req.sessionData.sessionId; // Get the session ID from the request
    // const { sessionId } = req.sessionData; 

    try {
        // 1. Retrieve cart items from Redis using tableId
        const cartKey = `cart:table:${tableId}`; 
        const cartData = await redis.get(cartKey);
        const cartItems = cartData ? JSON.parse(cartData) : []; 
        if (!cartItems ||  cartItems.length === 0) {
            return res.status(400).send({ error: 'Cart is empty' });
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
            sessionId: cartConfirmingSessionId,
            tableId,
            orderStatus: OrderStatus.CREATED,
            totalAmount
        })

        // 4. Create the order items in the database, tied to order
        await OrderItem.bulkCreate(orderItemsData.map(item => ({...item, orderId: order.orderId })));

        // 5. Publish 'order:created' event
        await new OrderCreatedPublisher(natsWrapper.client).publish({
            orderId: order.orderId,
            version: order.version,
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