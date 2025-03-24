import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { OrderStatus } from '@smartdine/common';

// Interface for Order attributes
interface OrderAttrs {
  userId: string;
  status: OrderStatus;
  expiresAt: Date;
  items: {
    menuItemId: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  totalAmount: number;
}

// Interface for Order Document
interface OrderDoc extends mongoose.Document {
  userId: string;
  status: OrderStatus;
  expiresAt: Date;
  items: {
    menuItemId: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  totalAmount: number;
  version: number;
}

// Interface for Order Model
interface OrderModel extends mongoose.Model<OrderDoc> {
  build(attrs: OrderAttrs): OrderDoc;
}

const orderSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: Object.values(OrderStatus),
    default: OrderStatus.Created
  },
  expiresAt: {
    type: mongoose.Schema.Types.Date
  },
  items: [{
    menuItemId: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    quantity: {
      type: Number,
      required: true
    }
  }],
  totalAmount: {
    type: Number,
    required: true
  }
}, {
  toJSON: {
    transform(doc: any, ret: any) {
      ret.id = ret._id;
      delete ret._id;
    }
  },
  timestamps: true,
  versionKey: 'version'
});

// Add optimistic concurrency control
orderSchema.set('versionKey', 'version');
orderSchema.plugin(updateIfCurrentPlugin);

orderSchema.statics.build = (attrs: OrderAttrs) => {
  return new Order(attrs);
};

const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema);

export { Order, OrderDoc, OrderStatus };
