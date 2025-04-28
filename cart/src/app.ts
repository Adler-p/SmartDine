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
import { checkoutCartRouter } from './routes/checkout';
import { redis } from './redis-client';
import cors from 'cors';

const app: express.Application = express();
app.set('trust proxy', true);
app.use(json());
app.use(cookieParser());
app.use(
  cookieSession({
    signed: false,
    secure: false,
  })
);

// Use CORS middleware
app.use(cors());  // This will allow all domains

app.use(currentUser(redis));

// app.use(deleteOrderRouter);
// app.use(indexOrderRouter);

app.use(addItemRouter);
app.use(removeItemRouter);
app.use(viewCartRouter);
app.use(updateCartQuantityRouter);
app.use(clearCartRouter);
app.use(checkoutCartRouter);

app.get('/test', async (req, res) => {
  console.log('Test endpoint started');
  
  setTimeout(() => {
      console.log('Timeout reached without response');
  }, 5000);  // Timeout after 5 seconds if no response is sent

  res.send('Test endpoint is working');
});

app.all('*', async (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);



export { app };
