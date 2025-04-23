import { Sequelize } from 'sequelize';
import { initUserModel, User } from './models/user';
import { initRefreshTokenModel, RefreshToken } from './models/refresh-token';

// 从环境变量构建连接字符串
const host = process.env.POSTGRES_HOST || 'localhost';
const port = process.env.POSTGRES_PORT || '5432';
const username = process.env.POSTGRES_USER || 'postgres';
const password = process.env.POSTGRES_PASSWORD || 'postgres';
const database = process.env.POSTGRES_DB || 'auth';

const postgresUri = `postgres://${username}:${password}@${host}:${port}/${database}`;

console.log('POSTGRES_URI:', postgresUri);

const sequelize = new Sequelize(postgresUri, {
  dialect: 'postgres', // Use PostgreSQL
  logging: false, // Disable SQL query logging
});

// Initialize models
initUserModel(sequelize);
initRefreshTokenModel(sequelize);

// Add associations
User.associate({ RefreshToken });
RefreshToken.associate({ User });

export { sequelize };