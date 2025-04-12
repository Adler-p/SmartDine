import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import { errorHandler, NotFoundError, currentUser } from '@smartdine/common';
import { createPaymentRouter } from './routes/new';
import { showPaymentRouter } from './routes/show';
import { indexPaymentRouter } from './routes/index';
import { updatePaymentStatusRouter } from './routes/update-status';

const app: express.Application = express();
app.set('trust proxy', true);
app.use(json());
app.use(
  cookieSession({
    signed: false,
    secure: false,
  })
);
app.use(currentUser);

app.use(createPaymentRouter);
app.use(showPaymentRouter);
app.use(indexPaymentRouter);
app.use(updatePaymentStatusRouter);

app.all('*', async (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app }; 