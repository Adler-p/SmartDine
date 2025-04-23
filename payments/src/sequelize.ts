import { Sequelize } from 'sequelize';
import { initPaymentModel, Payment } from './models/payment';

console.log('SQL_URI inside file:', process.env.SQL_URI);

const sequelize = new Sequelize(process.env.SQL_URI!, {
  dialect: 'postgres',
  logging: process.env.NODE_ENV !== 'production',
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// Initialize models
initPaymentModel(sequelize);

export { sequelize };