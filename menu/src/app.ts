import express from 'express'
import 'express-async-errors'
import { json } from 'body-parser'
import cookieSession from 'cookie-session'
import { errorHandler, NotFoundError, currentUser } from '@smartdine/common'

import { createMenuItemRouter } from './routes/staff/create-new-item'
import { listMenuItemRouter } from './routes/list-one-item'
import { indexMenuRouter } from './routes/index'
import { updateMenuItemRouter } from './routes/staff/update-entire-item'
import { updateMenuItemPriceRouter } from './routes/staff/update-price'
import { markMenuItemOutOfStockRouter } from './routes/staff/mark-out-of-stock'
import { deleteMenuItemRouter } from './routes/staff/delete-item'
import cors from 'cors'; 
import cookieParser from 'cookie-parser';
// 创建一个mock redis客户端
const mockRedisClient = {
  get: async () => null, // 始终返回null，表示token没有被加入黑名单
  set: async () => {}, // 空操作
  del: async () => {}  // 空操作
};

const app = express()
const corsOptions = {
  origin: ['http://localhost:3000', 'https://nus-iss-smart-dine.vercel.app'],
  credentials: true
};

app.use(cors(corsOptions));  
app.options('*', cors(corsOptions))
app.set('trust proxy', true)
app.use(json())
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
//     secure: false
//   })
// )

// 添加请求日志
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Headers:', JSON.stringify(req.headers));
  if (req.method !== 'GET') {
    console.log('Body:', JSON.stringify(req.body));
  }
  next();
});
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// 使用currentUser中间件，传入mock redis客户端
app.use(currentUser(mockRedisClient))

// Register routes
// Staff endpoints
app.use(createMenuItemRouter)
app.use(listMenuItemRouter)
app.use(indexMenuRouter)
app.use(updateMenuItemRouter)
app.use(updateMenuItemPriceRouter)
app.use(markMenuItemOutOfStockRouter)
app.use(deleteMenuItemRouter)

// 全局错误捕获
app.use((err, req, res, next) => {
  console.error('Uncaught error:', err);
  next(err);
});

// Handle 404 routes
app.all('*', async (req, res) => {
  console.log(`Route not found: ${req.method} ${req.url}`);
  throw new NotFoundError()
})

app.use(errorHandler)

export { app } 