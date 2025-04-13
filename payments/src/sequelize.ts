import { Sequelize } from 'sequelize';
import { initPaymentModel, Payment } from './models/payment';

const sequelize = new Sequelize(process.env.SQL_URI!, {
  dialect: 'postgres', // Use PostgreSQL
  logging: false, // Disable SQL query logging
});

// Initialize models
initPaymentModel(sequelize);


export { sequelize };