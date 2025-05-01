import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { v4 as uuidv4 } from 'uuid';

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
  id: string; // Mongoose automatically adds _id field
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
  _id: {
    type: String,
    default: uuidv4 // Generate UUID for _id
  },
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
  return new MenuItem({ _id: uuidv4(), ...attrs }); // Generate UUID when building
};

// Create and export MenuItem model
const MenuItem = mongoose.model<MenuItemDoc, MenuItemModel>('MenuItem', menuItemSchema);
export { MenuItem }; 