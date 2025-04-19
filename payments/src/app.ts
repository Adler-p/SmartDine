import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import { errorHandler, NotFoundError, currentUser } from '@smartdine/common';
import { customerUpdatePaymentStatusRouter } from './routes/customer/customer-update-payment-status';
import { listAllPaymentsRouter } from './routes/staff/list-all-payments';
import { viewOrderPaymentRouter } from './routes/staff/view-order-payment';
import { staffUpdatePaymentStatusRouter } from './routes/staff/staff-update-payment-status';
import { redis } from './redis-client';

const app: express.Application = express();
app.set('trust proxy', true);
app.use(json());
app.use(
  cookieSession({
    signed: false,
    secure: false,
  })
);
app.use(currentUser(redis));

// Customer endpoints
app.use(customerUpdatePaymentStatusRouter); 

// Staff endpoints
app.use(listAllPaymentsRouter); 
app.use(viewOrderPaymentRouter); 
app.use(staffUpdatePaymentStatusRouter);  // Manual payment at counter

app.all('*', async (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app }; 