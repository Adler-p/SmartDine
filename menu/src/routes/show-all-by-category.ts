import express, { Request, Response } from 'express'
import { MenuItem } from '../models/menu-item'
import { requireAuth, requireRole, UserRole } from '@smartdine/common'

const router = express.Router()

router.get(
  '/api/menu/category/:category',
  requireAuth,
  requireRole([UserRole.STAFF, UserRole.CUSTOMER]),
  async (req: Request, res: Response) => {
    const category = req.params.category
    const menuItems = await MenuItem.find({ 
      category, 
      availability: 'available' 
    })
    
    res.send(menuItems)
  }
)

export { router as showMenuItemsByCategoryRouter } 