import express, { Request, Response } from 'express'
import { body } from 'express-validator'
import {
  requireAuth,
  validateRequest,
  requireRole,
  NotFoundError,
  UserRole
} from '@smartdine/common'
import { MenuItem } from '../models/menu-item'
import { MenuItemUpdatedPublisher } from '../events/publishers/menu-item-updated-publisher'
import { natsWrapper } from '../nats-wrapper'

const router = express.Router()

// Update menu item route with validation
router.put(
  '/api/menu/:id',
  requireAuth,
  requireRole([UserRole.STAFF]),
  [
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
    const menuItem = await MenuItem.findById(req.params.id)

    if (!menuItem) {
      throw new NotFoundError()
    }

    const { name, description, price, category, imageUrl, availability } = req.body

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

    // Publish event with all relevant data
    await new MenuItemUpdatedPublisher(natsWrapper.client).publish({
      id: menuItem.id,
      name: menuItem.name,
      description: menuItem.description,
      price: menuItem.price,
      category: menuItem.category,
      imageUrl: menuItem.imageUrl,
      availability: menuItem.availability,
      version: menuItem.version
    })

    res.send(menuItem)
  }
)

export { router as updateMenuItemRouter } 