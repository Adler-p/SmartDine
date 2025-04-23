import { Sequelize } from 'sequelize';
import { initOrderModel, Order } from './models/order';
import { initOrderItemModel, OrderItem } from './models/orderItem';

const sequelize = new Sequelize(process.env.SQL_URI!, {
  dialect: 'postgres', // Use PostgreSQL
  logging: false, // Disable SQL query logging
});

// Initialize models
initOrderModel(sequelize);
initOrderItemModel(sequelize);

// Add associations
Order.associate({ OrderItem });
OrderItem.associate({ Order });

export { sequelize };