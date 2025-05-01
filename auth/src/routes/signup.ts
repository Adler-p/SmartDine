import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';
import { BadRequestError } from '@smartdine/common';
const { validateRequest } = require('@smartdine/common');
import { User, UserRole, initUserModel } from '../models/user';
import { UserCreatedPublisher } from '../events/publishers/user-created-publisher';
import { natsWrapper } from '../nats-wrapper';
import { sequelize } from '../sequelize';
import { Password } from '../services/password'; // Import Password hashing service


const router: express.Router = express.Router();
initUserModel(sequelize);

router.post(
  '/api/users/signup',
  [
    body('email')
      .isEmail()
      .withMessage('Email must be valid'),
    body('password')
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage('Password must be between 4 and 20 characters'),
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required'),
    body('role')
      .isIn([UserRole.CUSTOMER, UserRole.STAFF])
      .withMessage('Invalid role')
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password, name, role } = req.body;

    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      throw new BadRequestError('Email in use');
    }

    // Hash the password
    const hashedPassword = await Password.toHash(password);

    const user = await User.create({ email, password: password, name, role });

    // Generate JWT
    const userJwt = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_KEY!
    );

    // Store it on session object
    req.session = {
      jwt: userJwt
    };

    // Publish user created event
    await new UserCreatedPublisher(natsWrapper.client).publish({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      version: 0
    });

    // res.status(201).send(user);
    // Do not send password in response
    res.status(201).send({
      accessToken: userJwt,
      user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }});
  }
);

export { router as signupRouter };
