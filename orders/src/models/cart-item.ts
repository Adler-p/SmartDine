import mongoose from 'mongoose';

interface CartItemAttrs {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartItemDoc extends mongoose.Document {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartItemModel extends mongoose.Model<CartItemDoc> {
  build(attrs: CartItemAttrs): CartItemDoc;
}

const cartItemSchema = new mongoose.Schema({
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
    required: true,
    min: 1
  }
}, {
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
    }
  }
});

cartItemSchema.statics.build = (attrs: CartItemAttrs) => {
  return new CartItem(attrs);
};

const CartItem = mongoose.model<CartItemDoc, CartItemModel>('CartItem', cartItemSchema);

export { CartItem, CartItemDoc, CartItemAttrs }; 