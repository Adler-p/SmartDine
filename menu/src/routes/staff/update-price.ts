import express, { Request, Response } from 'express'
import { body } from 'express-validator'
import {
  requireAuth,
  validateRequest,
  NotFoundError,
  requireRole,
  UserRole
} from '@smartdine/common'
import { MenuItem } from '../../models/menu-item'
import { MenuItemUpdatedPublisher } from '../../events/publishers/menu-item-updated-publisher'
import { natsWrapper } from '../../nats-wrapper'

const router = express.Router()

// Update menu item price route with validation
router.patch(
  '/api/menu/:id/price',
  requireAuth,
  requireRole([UserRole.STAFF]),
  [
    body('price')
      .isFloat({ gt: 0 })
      .withMessage('Price must be a positive number')
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const menuItem = await MenuItem.findById(req.params.id)

    if (!menuItem) {
      throw new NotFoundError()
    }

    // Use the updatePrice method from the model
    menuItem.updatePrice(req.body.price)
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

export { router as updateMenuItemPriceRouter } 