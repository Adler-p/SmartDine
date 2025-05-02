import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { requireAuth, validateRequest, requireRole, UserRole } from '@smartdine/common';
import { MenuItem } from '../../models/menu-item';

const router = express.Router();

router.delete(
  '/api/menu',
  requireAuth,
  requireRole([UserRole.STAFF]),
  [
    body('id')
      .notEmpty()
      .isString()
      .withMessage('ID must be a valid string'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { id } = req.body;

    try {
      const result = await MenuItem.deleteOne({ name: id });

      if (result.deletedCount === 0) {
        return res.status(404).send({ message: 'Menu item not found' });
      }

      res.status(200).send({ message: 'Menu item deleted successfully' });
    } catch (error) {
      console.error('Error deleting menu item:', error);
      res.status(500).send({ error: 'Failed to delete menu item' });
    }
  }
);

export { router as deleteMenuItemRouter };