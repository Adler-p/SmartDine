import express, { Request, Response, NextFunction } from 'express';
import 'express-async-errors';
import bodyParser from 'body-parser';
import cookieSession from 'cookie-session';
import { NotFoundError } from '@smartdine/common';
const { errorHandler } = require('@smartdine/common');
import cors from 'cors';

import { currentUserRouter } from './routes/current-user';
import { signinRouter } from './routes/signin';
import { signoutRouter } from './routes/signout';
import { signupRouter } from './routes/signup';
import { sessionRouter } from './routes/new-session';
import { refreshTokenRouter } from './routes/refresh-token';
import cookieParser from 'cookie-parser';
const app: express.Application = express();
const corsOptions = {
  origin: ['http://localhost:3000', 'https://nus-iss-smart-dine.vercel.app'],
  credentials: true
};

app.use(cors(corsOptions));  
app.options('*', cors(corsOptions))
app.set('trust proxy', true);
app.use(bodyParser.json());
app.use(cookieParser());
// app.use(
//   cookieSession({
//     signed: false,
//     secure: false
//   })
// );

// app.use(
//   cookieSession({
//     signed: false,
//     secure: false,
//     httpOnly: true,
//     maxAge: 15 * 60 * 1000,
//     name: 'session',
//     path: '/',
//     sameSite: 'none'
//   })
// );

app.use((req, res, next) => {
  const token = req.cookies?.session;
  if (token) {
    req.session = { jwt: token }; 
  }
  next();
});

// Use CORS middleware

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.use(currentUserRouter);
app.use(signinRouter);
app.use(signoutRouter);
app.use(signupRouter);
app.use(sessionRouter);
app.use(refreshTokenRouter)

app.all('*', async (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
