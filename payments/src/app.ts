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
const corsOptions = {
  origin: ['http://localhost:3000', 'https://nus-iss-smart-dine.vercel.app'],
  credentials: true
};

app.use(cors(corsOptions));  
app.options('*', cors(corsOptions))
app.set('trust proxy', true);
app.use(json());
app.use(cookieParser()); 
// app.use(
//   cookieSession({
//     signed: false,
//     secure: false,
//   })
// );
app.use((req, res, next) => {
  const token = req.cookies?.session;
  if (token) {
    req.session = { jwt: token }; 
  }
  next();
});
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});
app.use(currentUser(redis));

// Health check
app.use(healthCheckRouter);

// Customer endpoints
app.use(customerUpdatePaymentStatusRouter); 
// app.use(createPaymentRouter);
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