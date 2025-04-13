// cart/src/app.ts
import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieParser from 'cookie-parser';
import cookieSession from 'cookie-session';
import { errorHandler, NotFoundError, currentUser } from '@smartdine/common';
import { addItemRouter } from './routes/add-item';
import { removeItemRouter } from './routes/remove-item';
import { viewCartRouter } from './routes/view-cart';
import { updateCartQuantityRouter } from './routes/update-quantity';
import { clearCartRouter } from './routes/clear-cart';

const app = express();
app.set('trust proxy', true);
app.use(json());
app.use(cookieParser());
app.use(
  cookieSession({
    signed: false,
    secure: false,
  })
);
app.use(currentUser);

app.use(addItemRouter);
app.use(removeItemRouter);
app.use(viewCartRouter);
app.use(updateCartQuantityRouter);
app.use(clearCartRouter);

app.all('*', async (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };