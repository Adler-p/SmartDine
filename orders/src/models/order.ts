// import mongoose from 'mongoose';
// import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { OrderStatus } from '@smartdine/common';
import { DataTypes, Model, Sequelize } from 'sequelize';
import { OrderItem } from './orderItem';

// Interface for Order attributes
interface OrderAttributes {
  orderId: string;
  sessionId: string;    // Session ID of customer who confirmed the cart
  tableId: string;
  orderStatus: OrderStatus;
  totalAmount: number;
  createdAt?: Date;
  updatedAt?: Date;
  version?: number; 
}

// Interface for Order Creation Attributes 
interface OrderCreationAttributes extends Omit<OrderAttributes, 'orderId' | 'orderStatus'> {
  orderStatus?: OrderStatus;
}

// Extend Sequelize Model to create Order model
export class Order extends Model<OrderAttributes, OrderCreationAttributes> implements OrderAttributes {
  public orderId!: string;
  public sessionId!: string;
  public tableId!: string;
  public orderStatus!: OrderStatus;
  public totalAmount!: number;
  // Timestamps (provided by Sequelize)
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly version!: number; 

  // This will be populated when you call `getOrderItems()` on an Order instance
  public readonly orderItems?: any[];
}

// Initialise the Order model
export const initOrderModel = (sequelize: Sequelize) => {
  Order.init({
    orderId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    sessionId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    tableId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    orderStatus: {
      type: DataTypes.ENUM(...Object.values(OrderStatus)),
      allowNull: false, 
      defaultValue: OrderStatus.CREATED
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'orders',
    timestamps: true, // Automatically adds createdAt and updatedAt
    version: true, // Enables optimistic concurrency control
  });

  return Order;
}

// Add optimistic concurrency control
// orderSchema.set('versionKey', 'version');
// orderSchema.plugin(updateIfCurrentPlugin);

// orderSchema.statics.build = (attrs: OrderAttrs) => {
//   return new Order(attrs);
// };

// const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema);

// export { Order, OrderDoc, OrderStatus };
