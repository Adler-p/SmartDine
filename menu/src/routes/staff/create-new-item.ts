import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { requireAuth, validateRequest, requireRole, UserRole } from '@smartdine/common';
import { MenuItem } from '../../models/menu-item';
import { MenuItemCreatedPublisher } from '../../events/publishers/menu-item-created-publisher';
import { natsWrapper } from '../../nats-wrapper';

const router = express.Router();

// Create new menu item route with validation
router.post(
  '/api/menu',
  requireAuth,
  requireRole([UserRole.STAFF]),
  [
    body('name')
      .not()
      .isEmpty()
      .withMessage('Name is required'),
    body('description')
      .not()
      .isEmpty()
      .withMessage('Description is required'),
    body('price')
      .isFloat({ gt: 0 })
      .withMessage('Price must be greater than 0'),
    body('category')
      .not()
      .isEmpty()
      .withMessage('Category is required'),
    body('imageUrl')
      .optional()
      .isURL()
      .withMessage('Image URL must be valid'),
    body('availability')
      .optional()
      .isIn(['available', 'out_of_stock'])
      .withMessage('Availability must be either "available" or "out_of_stock"')
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { name, description, price, category, imageUrl, availability } = req.body;

    // Create menu item
    const menuItem = MenuItem.build({
      name,
      description,
      price,
      category,
      imageUrl,
      availability: availability || 'available'
    });
    await menuItem.save();

    // Publish event with all relevant data
    await new MenuItemCreatedPublisher(natsWrapper.client).publish({
      id: menuItem.id,
      name: menuItem.name,
      description: menuItem.description,
      price: menuItem.price,
      category: menuItem.category,
      imageUrl: menuItem.imageUrl,
      availability: menuItem.availability,
      version: menuItem.version
    });

    res.status(201).send(menuItem);
  }
);

export { router as createMenuItemRouter }; 