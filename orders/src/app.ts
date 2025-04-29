import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import { errorHandler, NotFoundError, currentUser } from '@smartdine/common';
import { createOrderRouter } from './routes/customer/new-order';
import { showOrderRouter } from './routes/customer/view-order';
import { staffViewOrderRouter } from './routes/staff/view-order';
import { staffViewAllOrdersRouter } from './routes/staff/view-all-orders';
import { updateOrderStatusRouter } from './routes/staff/update-order-status';
import { redis } from './redis-client';
import cors from 'cors';

const app: express.Application = express();
const corsOptions = {
  origin: ['http://localhost:3000', 'https://nus-iss-smart-dine.vercel.app'],
  credentials: true
};

app.use(cors(corsOptions));  
app.options('*', cors(corsOptions))
app.set('trust proxy', true);
app.use(json());
app.use(
  cookieSession({
    signed: false,
    secure: false,
  })
);

app.get('/health', (req, res) => {
  res.status(200).send('OK');
}); 
app.use(currentUser(redis));

// app.use(deleteOrderRouter);
// app.use(indexOrderRouter);

app.use(createOrderRouter);
app.use(showOrderRouter);
app.use(updateOrderStatusRouter);
app.use(staffViewOrderRouter);
app.use(staffViewAllOrdersRouter);

app.all('*', async (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
