import { Router } from 'express';
import {
  createProduct,
  getAllProduct,
  getProductById,
  deleteProductById,
} from '../controllers/productController.js';
import { validateProductInput } from '../middleware/validationMiddleware.js';
import { authenticateUser } from '../middleware/authMiddleware.js';

const router = Router();

router
  .route('/product')
  .get(getAllProduct)
  .post(authenticateUser, validateProductInput, createProduct);
router
  .route('/product/:id')
  .get(getProductById)
  .delete(authenticateUser, deleteProductById);

export default router;
