import { Sequelize } from 'sequelize';
import { initOrderModel } from './models/order';
import { initOrderItemModel } from './models/orderItem';

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
const Order = initOrderModel(sequelize);
const OrderItem = initOrderItemModel(sequelize);

// Set up associations after both models are initialized
Order.hasMany(OrderItem, {
  foreignKey: 'orderId',
  as: 'orderItems'
});

OrderItem.belongsTo(Order, {
  foreignKey: 'orderId',
  as: 'order'
});

export { sequelize, Order, OrderItem };