import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';
import { validateRequest, BadRequestError } from '@smartdine/common';
import { Password } from '../services/password';
import { initUserModel, User } from '../models/user';
import { initRefreshTokenModel, RefreshToken } from '../models/refresh-token';
import { sequelize } from '../sequelize';
import { Op } from 'sequelize';
import { generateRefreshToken } from '../services/generate-refresh-token';

const router: express.Router = express.Router();
const userModel = initUserModel(sequelize);
const refreshTokenModel = initRefreshTokenModel(sequelize);

router.post(
    '/api/users/refresh-token', 
    async (req: Request, res: Response) => {
        const refreshTokenFromCookie = req.cookies.refreshToken;

        if (!refreshTokenFromCookie) {
            throw new BadRequestError('Refresh token not found');
        }
        
        const refreshTokenRecord = await refreshTokenModel.findOne({ 
            where: { 
                token: refreshTokenFromCookie, 
                expiry: { [Op.gt]: new Date() },
                revoked: false
            }, 
            include: [{ model: userModel, as: 'user' }]
         });

         if (!refreshTokenRecord || !refreshTokenRecord.user) {
            throw new BadRequestError('Invalid refresh token'); 
         }

         // Mark old refresh token as revoked
         await refreshTokenRecord.update({ revoked: true });

         // Generate new access token 
         const accessToken = jwt.sign(
            {
                id: refreshTokenRecord.user.id,
                email: refreshTokenRecord.user.email,
                role: refreshTokenRecord.user.role
            },
            process.env.JWT_KEY!,
            { expiresIn: '5m' } // Token expires in 5 minutes
        );

        // Generate new Refresh Token
        const newRefreshToken = await generateRefreshToken(refreshTokenRecord.user.id);

        // Update session with new access token
        // req.session = {
        //     jwt: accessToken
        // };

        // Send new refresh token as HTTP-only, secure cookie
        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
            sameSite: 'none',
            maxAge: 7 * 24 * 60 * 60 * 1000 
          });
        // Send new access token as a cookie
        res.cookie('session', accessToken, {
            httpOnly: true,
            secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
            sameSite: 'none',
            maxAge: 7 * 24 * 15 * 60 * 1000
          });
        
        res.status(200).send({ accessToken });
    }
); 

export { router as refreshTokenRouter };