import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import { errorHandler, NotFoundError, currentUser } from '@smartdine/common';
import { deleteOrderRouter } from './routes/delete';
import { indexOrderRouter } from './routes/index';
import { createOrderRouter } from './routes/new';
import { showOrderRouter } from './routes/show';
import { updateOrderStatusRouter } from './routes/staff/update-status';
import { staffOrderRouter } from './routes/staff/index';

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

app.use(deleteOrderRouter);
app.use(indexOrderRouter);
app.use(createOrderRouter);
app.use(showOrderRouter);
app.use(updateOrderStatusRouter);
app.use(staffOrderRouter);

app.all('*', async (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
