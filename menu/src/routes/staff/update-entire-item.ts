import express, { Request, Response } from 'express'
import { body } from 'express-validator'
import {
  requireAuth,
  validateRequest,
  requireRole,
  NotFoundError,
  UserRole,
  BadRequestError
} from '@smartdine/common'
import { MenuItem } from '../../models/menu-item'
import { MenuItemUpdatedPublisher } from '../../events/publishers/menu-item-updated-publisher'
import { natsWrapper } from '../../nats-wrapper'
import mongoose from 'mongoose'

const router = express.Router()

// Update menu item route with validation
router.put(
  '/api/menu',
  requireAuth,
  requireRole([UserRole.STAFF]),
  [
    body('id')
      .notEmpty()
      .withMessage('Menu item ID is required'),
    body('name')
      .optional()
      .not()
      .isEmpty()
      .withMessage('Name cannot be empty'),
    body('description')
      .optional()
      .not()
      .isEmpty()
      .withMessage('Description cannot be empty'),
    body('price')
      .optional()
      .isFloat({ gt: 0 })
      .withMessage('Price must be greater than 0'),
    body('category')
      .optional()
      .not()
      .isEmpty()
      .withMessage('Category cannot be empty'),
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
    const { id } = req.body;
    
    try {
      // 检查ID是否是有效的MongoDB ObjectId
      if (!mongoose.Types.ObjectId.isValid(id)) {
        console.log('Invalid ID format:', id);
        return res.status(400).send({ error: 'Invalid ID format' });
      }

      console.log('Finding menu item to update, ID:', id);
      const menuItem = await MenuItem.findById(id)

      if (!menuItem) {
        console.log('Menu item not found with ID:', id);
        throw new NotFoundError()
      }

      const { name, description, price, category, imageUrl, availability } = req.body

      // 验证至少有一个字段需要更新
      if (!name && !description && !price && !category && imageUrl === undefined && availability === undefined) {
        throw new BadRequestError('At least one field must be provided for update');
      }

      console.log('Updating menu item:', { name, description, price, category, imageUrl, availability });
      
      // Update only provided fields
      if (name) menuItem.set('name', name)
      if (description) menuItem.set('description', description)
      if (price) {
        // Use the updatePrice method from the model
        menuItem.updatePrice(price)
      }
      if (category) menuItem.set('category', category)
      if (imageUrl !== undefined) menuItem.set('imageUrl', imageUrl)
      if (availability !== undefined) {
        if (availability === 'out_of_stock') {
          // Use the markAsOutOfStock method from the model
          menuItem.markAsOutOfStock()
        } else {
          menuItem.set('availability', availability)
        }
      }

      await menuItem.save()
      console.log('Menu item saved with updated values');

      // 使用超时处理事件发布
      try {
        console.log('Publishing menu item updated event');
        const publishPromise = new MenuItemUpdatedPublisher(natsWrapper.client).publish({
          id: menuItem.id,
          name: menuItem.name,
          description: menuItem.description,
          price: menuItem.price,
          category: menuItem.category,
          imageUrl: menuItem.imageUrl,
          availability: menuItem.availability,
          version: menuItem.version
        });
        
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Event publish timeout')), 1500);
        });
        
        await Promise.race([publishPromise, timeoutPromise])
          .catch(error => {
            console.warn('Event publishing error or timeout:', error.message);
            // 继续执行，不阻塞响应
          });
      } catch (publishError) {
        console.error('Error preparing to publish update event:', publishError);
        // 继续执行，不阻塞响应
      }

      return res.status(200).send(menuItem)
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof BadRequestError) {
        throw error;
      }
      console.error('Error updating menu item:', error);
      return res.status(500).send({ error: 'Failed to update menu item' });
    }
  }
)

export { router as updateMenuItemRouter } 