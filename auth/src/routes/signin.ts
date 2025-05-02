import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';
import { BadRequestError } from '@smartdine/common';
const { validateRequest } = require('@smartdine/common');
import { Password } from '../services/password';
import { User, initUserModel } from '../models/user';
import { sequelize } from '../sequelize';
import { generateRefreshToken } from '../services/generate-refresh-token';


const router: express.Router = express.Router();
initUserModel(sequelize);

// 添加测试路由用于验证 cookie
router.get('/api/users/test-cookies', (req, res) => {
  console.log('Test cookie route');
  console.log('Current session:', req.session);
  console.log('Request cookies:', req.headers.cookie);
  res.send({ session: req.session, cookies: req.headers.cookie });
});

router.post(
  '/api/users/signin',
  [
    body('email')
      .isEmail()
      .withMessage('Email must be valid'),
    body('password')
      .trim()
      .notEmpty()
      .withMessage('You must supply a password')
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    console.log('Request headers:', {
      host: req.headers.host,
      origin: req.headers.origin,
      referer: req.headers.referer
    });
    
    const { email, password } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    
    if (!existingUser) {
      throw new BadRequestError('Invalid user');
    }

    const passwordsMatch = await Password.compare(
      existingUser.password,
      password
    );
    if (!passwordsMatch) {
      throw new BadRequestError('Invalid password');
    }

    // Generate JWT Access Token
    const accessToken = jwt.sign(
      {
        id: existingUser.id,
        email: existingUser.email,
        role: existingUser.role
      },
      process.env.JWT_KEY!,
      { expiresIn: '60m' } // Token expires in 60 minutes
    )

    console.log('Access Token:', accessToken);

    // Generate and Store Refresh Token
    const refreshToken = await generateRefreshToken(existingUser.id);

    // 不使用 req.session，而是直接设置 cookie
    // req.session = {
    //   jwt: accessToken
    // };
    
    // 直接设置两个 cookie，确保它们有相同的配置
    // Send Access Token as a cookie
    res.cookie('session', accessToken, {
      httpOnly: true,
      secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
      sameSite: 'none',
      path: '/',
      maxAge: 7* 24* 60 * 60 * 1000
    });

    // Send Refresh Token as HTTP-only, Secure Cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
      sameSite: 'none',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000 
    }); 

    console.log('Cookies being set:', res.getHeader('Set-Cookie'));

    res.status(200).send({ accessToken, user: { id: existingUser.id, email: existingUser.email, role: existingUser.role, name: existingUser.name } });
  }
);

export { router as signinRouter };
