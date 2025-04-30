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
const app = express();
const corsOptions = {
  origin: ['http://localhost:3000', 'https://nus-iss-smart-dine.vercel.app'],
  credentials: true
};

app.use(cors(corsOptions));  
app.options('*', cors(corsOptions))
app.set('trust proxy', true);
app.use(json());
app.use(cookieParser());
app.use((req, res, next) => {
  const token = req.cookies?.session;
  if (token) {
    req.session = { jwt: token }; 
  }
  next();
});
// app.use(
//   cookieSession({
//     signed: false,
//     secure: false,
//   })
// );
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});
app.use(currentUser(redis));

// 添加请求日志中间件
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// 添加测试路由 - 放在通配符路由前面
app.get('/test', (req, res) => {
  console.log('Test endpoint hit: starting response');
  res.status(200).send('Test endpoint is working');
  console.log('Test endpoint: response sent');
});

app.use(addItemRouter);
app.use(removeItemRouter);
app.use(viewCartRouter);
app.use(updateCartQuantityRouter);
app.use(clearCartRouter);
app.use(checkoutCartRouter);

app.all('*', async (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);



export { app };
