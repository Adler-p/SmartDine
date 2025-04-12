import express, { Request, Response } from 'express'
import { MenuItem } from '../models/menu-item'
import { requireAuth, requireRole, UserRole } from '@smartdine/common'

const router = express.Router()

router.get(
  '/api/menu',
  requireAuth,
  requireRole([UserRole.STAFF, UserRole.CUSTOMER]),
  async (req: Request, res: Response) => {
    const filterAvailable = req.query.available === 'true'
    
    let query = {}
    if (filterAvailable) {
      query = { availability: 'available' }
    }

    const menuItems = await MenuItem.find(query)
    
    res.send(menuItems)
  }
)

export { router as showAllMenuItemsRouter } 