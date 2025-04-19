import express, { Request, Response } from 'express'
import { NotFoundError, requireAuth, requireRole, UserRole } from '@smartdine/common'
import { MenuItem } from '../models/menu-item'

const router = express.Router()

// Get single menu item by ID
router.get(
  '/api/menu/:id',
  // requireAuth,
  // requireRole([UserRole.STAFF, UserRole.CUSTOMER]),
  async (req: Request, res: Response) => {
    const menuItem = await MenuItem.findById(req.params.id)

    if (!menuItem) {
      throw new NotFoundError()
    }

    res.send(menuItem)
  }
)

export { router as listMenuItemRouter } 