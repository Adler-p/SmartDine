import express, { Request, Response } from 'express'
import {
  requireAuth,
  validateRequest,
  requireRole,
  NotFoundError,
  UserRole
} from '@smartdine/common'
import { MenuItem } from '../../models/menu-item'
import { MenuItemUpdatedPublisher } from '../../events/publishers/menu-item-updated-publisher'
import { natsWrapper } from '../../nats-wrapper'

const router = express.Router()

// Mark menu item as out of stock route
router.put(
  '/api/menu/:id/out-of-stock',
  requireAuth,
  requireRole([UserRole.STAFF]),
  async (req: Request, res: Response) => {
    const menuItem = await MenuItem.findById(req.params.id)

    if (!menuItem) {
      throw new NotFoundError()
    }

    // Use the markAsOutOfStock method from the model
    menuItem.markAsOutOfStock()
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

export { router as markMenuItemOutOfStockRouter } 