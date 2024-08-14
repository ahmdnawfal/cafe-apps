import { Router } from 'express';
import {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransactionStatus,
} from '../controllers/transactionController.js';
import { validateTransaction } from '../middleware/validationMiddleware.js';

const router = Router();

router.post('/transaction', validateTransaction, createTransaction);
router.get('/transaction', getTransactions);
router.get('/transaction/:id', getTransactionById);
router.post('/transaction/:id', updateTransactionStatus);

export default router;
