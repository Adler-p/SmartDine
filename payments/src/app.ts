import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import cookieParser from 'cookie-parser';
import { errorHandler, NotFoundError, currentUser } from '@smartdine/common';
import { customerUpdatePaymentStatusRouter } from './routes/customer/customer-update-payment-status';
import { createPaymentRouter } from './routes/customer/create-payment';
import { getPaymentRouter } from './routes/customer/get-payment';
import { listAllPaymentsRouter } from './routes/staff/list-all-payments';
import { viewOrderPaymentRouter } from './routes/staff/view-order-payment';
import { staffUpdatePaymentStatusRouter } from './routes/staff/staff-update-payment-status';
import { healthCheckRouter } from './routes/healthcheck';
import { redis } from './redis-client';
import cors from 'cors';
const app: express.Application = express();
app.use(cors(
  {
  origin: ['http://localhost:3000', 'https://nus-iss-smart-dine.vercel.app'],
  credentials: true
  }
));  
app.options('*', cors())
app.set('trust proxy', true);
app.use(json());
app.use(cookieParser()); 
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

// Health check
app.use(healthCheckRouter);

// Customer endpoints
app.use(customerUpdatePaymentStatusRouter); 
app.use(createPaymentRouter);
app.use(getPaymentRouter);

// Staff endpoints
app.use(listAllPaymentsRouter); 
app.use(viewOrderPaymentRouter); 
app.use(staffUpdatePaymentStatusRouter);  // Manual payment at counter

app.all('*', async (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app }; 