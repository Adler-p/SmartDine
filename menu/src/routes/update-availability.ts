import express, { Request, Response } from 'express'
import { body } from 'express-validator'
import {
  requireAuth,
  validateRequest,
  NotFoundError,
  requireRole,
  UserRole
} from '@smartdine/common'
import { MenuItem } from '../models/menu-item'
import { MenuItemUpdatedPublisher } from '../events/publishers/menu-item-updated-publisher'
import { natsWrapper } from '../nats-wrapper'

const router = express.Router()

router.patch(
  '/api/menu/:id/availability',
  requireAuth,
  requireRole([UserRole.STAFF]),
  [
    body('availability')
      .isIn(['available', 'out_of_stock'])
      .withMessage('Availability must be either "available" or "out_of_stock"')
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const menuItem = await MenuItem.findById(req.params.id)

    if (!menuItem) {
      throw new NotFoundError()
    }

    // Use appropriate method depending on the value
    if (req.body.availability === 'out_of_stock') {
      menuItem.markAsOutOfStock()
    } else {
      menuItem.set('availability', req.body.availability)
    }
    
    await menuItem.save()

    // Publish event
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

export { router as updateMenuItemAvailabilityRouter } 