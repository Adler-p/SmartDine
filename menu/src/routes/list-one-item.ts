import express, { Request, Response } from 'express'
import { NotFoundError, requireAuth, requireRole, UserRole, BadRequestError } from '@smartdine/common'
import { MenuItem } from '../models/menu-item'
import mongoose from 'mongoose'

const router = express.Router()

// Get single menu item by ID
router.get(
  '/api/menu/:id',
  requireAuth,
  requireRole([UserRole.STAFF, UserRole.CUSTOMER]),
  async (req: Request, res: Response) => {
    const { id } = req.params;
    
    try {
      // 检查ID是否是有效的MongoDB ObjectId
      if (!mongoose.Types.ObjectId.isValid(id)) {
        console.log('Invalid ID format:', id);
        return res.status(404).send({ error: 'Menu item not found' });
      }

      console.log('Finding menu item with ID:', id);
      const menuItem = await MenuItem.findById(id)

      if (!menuItem) {
        console.log('Menu item not found with ID:', id);
        throw new NotFoundError()
      }

      console.log('Menu item found:', menuItem);
      return res.status(200).send(menuItem)
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      // 处理所有其他错误为404
      console.error('Error retrieving menu item:', error);
      return res.status(404).send({ error: 'Menu item not found' });
    }
  }
)

export { router as listMenuItemRouter } 