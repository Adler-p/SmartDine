import crypto from 'crypto';
import { promisify } from 'util';
import { initRefreshTokenModel } from '../models/refresh-token';
import { sequelize } from '../sequelize';

const randomBytes = promisify(crypto.randomBytes);
const refreshTokenModel = initRefreshTokenModel(sequelize);

export const generateRefreshToken = async (userId: string) => {
  
    const token = (await randomBytes(64)).toString('hex');
    const expiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
    await refreshTokenModel.create({
        token,
        userId,
        expiry, 
        revoked: false
    }); 

  return token;
};