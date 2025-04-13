import express, { Request, Response } from 'express'
import { MenuItem } from '../models/menu-item'
import { query } from 'express-validator';

const router = express.Router()

// Get all menu items, optionally filter by category 
router.get('/api/menu', 
  [
    query('category')
      .optional()
      .isString()
      .withMessage('Category must be a string'),
  ],
  async (req: Request, res: Response) => {
  const { category } = req.query; 

  const query: any = {}; 
  if (category) {
    query.category = category; 
  }

  const menuItems = await MenuItem.find({query});
  if (!menuItems) {
    return res.status(404).send({ error: 'No menu items found' });
  }
  res.send(menuItems)
})

export { router as indexMenuRouter } 