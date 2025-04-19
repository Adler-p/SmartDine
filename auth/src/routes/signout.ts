import { redis } from '../redis-client';
import jwt from 'jsonwebtoken';
import express from 'express';
import { initRefreshTokenModel, RefreshToken } from '../models/refresh-token';
import { sequelize } from '../sequelize';

const router: express.Router = express.Router();
const refreshTokenModel = initRefreshTokenModel(sequelize);

router.post('/api/users/signout', async (req, res) => {
  const refreshTokenFromCookie = req.cookies.refreshToken;

  if (refreshTokenFromCookie) {
    // Revoke refresh token in Database
    await refreshTokenModel.update(
      { revoked: true },
      { where: { token: refreshTokenFromCookie } }
    );

    // Clear refresh token cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
      sameSite: 'strict',
    });
  }

  // Clear access token from session 
  req.session = null;

  res.status(200).send({ message: 'User successfully logged out' });




  // const token = req.session?.jwt;

  // if (token) {
  //   try {
  //     // Decode the token to get its expiration time
  //     const payload = jwt.decode(token) as { exp: number };

  //     if (payload && payload.exp) {
  //       const expiration = payload.exp - Math.floor(Date.now() / 1000); // Remaining time in seconds

  //       // Add the token to the Redis blacklist with an expiration time only if it has not expired
  //       if (expiration > 0) {
  //         redis.set(token, 'blacklisted', 'EX', expiration, (err) => {
  //           if (err) {
  //             console.error('Error adding token to Redis blacklist:', err);
  //           }
  //         });
  //       }
  //     }
  //   } catch (err) {
  //     console.error('Error decoding JWT during signout:', err);
  //   }
  // }

  // // Clear the session
  // req.session = null;

  // // Return a success message for better clarity
  // res.status(200).send({ message: 'User successfully logged out' });
});

export { router as signoutRouter };
