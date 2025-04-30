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
      { expiresIn: '5m' } // Token expires in 5 minutes
    )

    // Generate and Store Refresh Token
    const refreshToken = await generateRefreshToken(existingUser.id);

    // Store Access Token in Session 
    req.session = {
      jwt: accessToken
    };

    // Send Refresh Token as HTTP-only, Secure Cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000 
    }); 

    res.status(200).send({ user: { id: existingUser.id, email: existingUser.email, role: existingUser.role, name: existingUser.name } });
  }
);

export { router as signinRouter };
