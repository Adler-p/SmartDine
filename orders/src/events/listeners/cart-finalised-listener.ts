import { Message } from 'node-nats-streaming';
import { Listener, CartFinalisedEvent, Subjects, OrderStatus } from '@smartdine/common';
import { queueGroupName } from './queue-group-name';
import { OrderCreatedPublisher } from '../../events/publishers/order-created-publisher';
import { Order, OrderItem } from '../../sequelize';
import { natsWrapper } from '../../nats-wrapper';

export class CartFinalisedListener extends Listener<CartFinalisedEvent> {
    readonly subject = Subjects.CartFinalised;
    queueGroupName = queueGroupName;
    
    async onMessage(data: CartFinalisedEvent['data'], msg: Message) {
        const { sessionId, tableId, items } = data;
    
        try {
            // 2. Calculate total amount of order 
            let totalAmount = 0;
            const orderItemsData = []; 
            items.forEach((item) => {
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
                items: items.map(item => ({
                    itemId: item.itemId,
                    itemName: item.itemName,
                    unitPrice: item.unitPrice,
                    quantity: item.quantity
                }))
            });
            msg.ack();
        } catch (err) {
            console.error('Error processing CartFinalised event:', err);
            msg.ack();
            return;
        }
    }
    
}