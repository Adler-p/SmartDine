import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Order, OrderStatus } from '../../models/order';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';

it('returns an error if the ticket does not exist', async () => {
  const ticketId = new mongoose.Types.ObjectId();

  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ ticketId })
    .expect(404);
});

it('returns an error if the ticket is already reserved', async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20,
  });
  await ticket.save();
  const order = Order.build({
    ticket,
    userId: 'laskdflkajsdf',
    status: OrderStatus.Created,
    expiresAt: new Date(),
  });
  await order.save();

  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ ticketId: ticket.id })
    .expect(400);
});

it('reserves a ticket', async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20,
  });
  await ticket.save();

  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ ticketId: ticket.id })
    .expect(201);
});

it('emits an order created event', async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20,
  });
  await ticket.save();

  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ ticketId: ticket.id })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it('returns an error if the items array is empty', async () => {
  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({
      items: []
    })
    .expect(400);
});

it('creates an order with valid inputs', async () => {
  const items = [
    {
      menuItemId: new mongoose.Types.ObjectId().toHexString(),
      name: 'Test Item',
      price: 20,
      quantity: 1
    }
  ];

  const response = await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({
      items
    })
    .expect(201);

  const order = await Order.findById(response.body.id);
  expect(order).not.toBeNull();
  expect(order!.status).toEqual(OrderStatus.Created);
  expect(order!.items.length).toEqual(1);
  expect(order!.totalAmount).toEqual(20);
});

it('emits an order created event', async () => {
  const items = [
    {
      menuItemId: new mongoose.Types.ObjectId().toHexString(),
      name: 'Test Item',
      price: 20,
      quantity: 1
    }
  ];

  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({
      items
    })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
