import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { requireAuth, validateRequest, requireRole, UserRole, BadRequestError } from '@smartdine/common';
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
    console.log('=====> CREATE MENU ITEM - Request received:', req.body);
    
    try {
      const { name, description, price, category, imageUrl, availability } = req.body;

      if (!name || !description || !price || !category) {
        console.error('=====> Missing required fields in request');
        throw new BadRequestError('Missing required fields');
      }

      console.log('=====> Building menu item object');
      // Create menu item
      const menuItem = MenuItem.build({
        name,
        description,
        price,
        category,
        imageUrl,
        availability: availability || 'available'
      });
      
      console.log('=====> Saving menu item to database');
      try {
        await menuItem.save();
        console.log('=====> Menu item saved with ID:', menuItem.id);
      } catch (dbError) {
        console.error('=====> Database error saving menu item:', dbError);
        throw new Error(`Failed to save menu item: ${dbError.message}`);
      }

      // Publish event with all relevant data
      console.log('=====> About to publish menu item created event');
      try {
        // 设置超时，避免永久阻塞
        console.log('=====> Setting up publish promise with timeout');
        const publishPromise = new MenuItemCreatedPublisher(natsWrapper.client).publish({
          id: menuItem.id,
          name: menuItem.name,
          description: menuItem.description,
          price: menuItem.price,
          category: menuItem.category,
          imageUrl: menuItem.imageUrl,
          availability: menuItem.availability,
          version: menuItem.version
        });
        
        console.log('=====> Setting up timeout promise (2000ms)');
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => {
            console.log('=====> Event publish timeout reached');
            reject(new Error('Event publish timeout'));
          }, 2000);
        });
        
        console.log('=====> Awaiting Promise.race for publish');
        await Promise.race([publishPromise, timeoutPromise])
          .then(() => {
            console.log('=====> Event published successfully or timed out');
          })
          .catch(error => {
            console.warn('=====> Event publishing error or timeout:', error.message);
            // 继续执行，不阻塞响应
          });
        console.log('=====> After publish promise resolution');
      } catch (publishError) {
        console.error('=====> Error preparing to publish event:', publishError);
        // 继续执行，不阻塞响应
      }

      console.log('=====> CRITICAL: Preparing to send response');
      console.log('=====> Response data:', JSON.stringify(menuItem));
      res.status(201).send(menuItem);
      console.log('=====> CRITICAL: Response sent!');
      return;
    } catch (error) {
      console.error('=====> Error creating menu item:', error);
      throw error;
    }
  }
);

export { router as createMenuItemRouter }; 