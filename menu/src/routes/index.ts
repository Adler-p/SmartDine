import express, { Request, Response } from 'express'
import { MenuItem } from '../models/menu-item'

const router = express.Router()

// Get all menu items
router.get('/api/menu', async (req: Request, res: Response) => {
  const menuItems = await MenuItem.find({})
  res.send(menuItems)
})

export { router as indexMenuRouter } 