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

  const queryFilter: any = {}; 
  if (category) {
    queryFilter.category = category; 
  }

  try {
    console.log('Finding menu items with filter:', queryFilter);
    const menuItems = await MenuItem.find(queryFilter);
    console.log('Found menu items:', menuItems);
    if (!menuItems || menuItems.length === 0) {
      return res.status(404).send({ error: 'No menu items found' });
    }
    return res.status(200).send(menuItems);
  } catch (error) {
    console.error('Error finding menu items:', error);
    return res.status(500).send({ error: 'Failed to retrieve menu items' });
  }
})

export { router as indexMenuRouter } 