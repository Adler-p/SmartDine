import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

// Interface describing MenuItem attributes
interface MenuItemAttrs {
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  availability: string;
}

// Interface describing MenuItem Model
interface MenuItemModel extends mongoose.Model<MenuItemDoc> {
  build(attrs: MenuItemAttrs): MenuItemDoc;
}

// Interface describing MenuItem Document
interface MenuItemDoc extends mongoose.Document {
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  availability: string;
  version: number;
  
  // Methods required by UML diagram
  updatePrice(newPrice: number): void;
  markAsOutOfStock(): void;
}

// Mongoose schema for MenuItem
const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String
  },
  availability: {
    type: String,
    required: true,
    enum: ['available', 'out_of_stock'],
    default: 'available'
  }
}, {
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
    }
  }
});

// Add versioning plugin
menuItemSchema.set('versionKey', 'version');
menuItemSchema.plugin(updateIfCurrentPlugin);

// Implementation of updatePrice method
menuItemSchema.methods.updatePrice = function(newPrice: number) {
  this.set('price', newPrice);
};

// Implementation of markAsOutOfStock method
menuItemSchema.methods.markAsOutOfStock = function() {
  this.set('availability', 'out_of_stock');
};

// Static method to build a new MenuItem
menuItemSchema.statics.build = (attrs: MenuItemAttrs) => {
  return new MenuItem(attrs);
};

// Create and export MenuItem model
const MenuItem = mongoose.model<MenuItemDoc, MenuItemModel>('MenuItem', menuItemSchema);
export { MenuItem }; 