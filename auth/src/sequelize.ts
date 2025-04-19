import { Sequelize } from 'sequelize';
import { initUserModel, User } from './models/user';
import { initRefreshTokenModel, RefreshToken } from './models/refresh-token';

console.log('POSTGRES_URI inside file:', process.env.POSTGRES_URI);

const sequelize = new Sequelize(process.env.POSTGRES_URI!, {
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