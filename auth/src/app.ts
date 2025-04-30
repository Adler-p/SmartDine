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

const app: express.Application = express();
const corsOptions = {
  origin: ['http://localhost:3000', 'https://nus-iss-smart-dine.vercel.app'],
  credentials: true
};

app.use(cors(corsOptions));  
app.options('*', cors(corsOptions))
app.set('trust proxy', true);
app.use(bodyParser.json());
// app.use(
//   cookieSession({
//     signed: false,
//     secure: false
//   })
// );

app.use(
  cookieSession({
    signed: false,
    secure: false,
    httpOnly: true, // This is a top-level option in cookieSession
    maxAge: 15 * 60 * 1000, // This is also a top-level option
    name: 'session', // You can specify a name for the cookie
    // domain: 'localhost', // This should work as a top-level option
    // path: '/', // This should also work as a top-level option
    sameSite: 'none'
  })
);

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
