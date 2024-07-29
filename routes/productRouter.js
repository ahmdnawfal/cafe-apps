import { Router } from 'express';
import {
  createProduct,
  getAllProduct,
  getProductById,
  deleteProductById,
} from '../controllers/productController.js';
import { validateProductInput } from '../middleware/validationMiddleware.js';

const router = Router();

router
  .route('/product')
  .get(getAllProduct)
  .post(validateProductInput, createProduct);
router.route('/product/:id').get(getProductById).delete(deleteProductById);

export default router;
