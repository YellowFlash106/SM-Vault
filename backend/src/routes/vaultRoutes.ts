 // backend/src/routes/vaultRoutes.ts

import express from 'express';
import {
  createVaultItem,
  getVaultItems,
  getVaultItem,
  updateVaultItem,
  deleteVaultItem,
  deleteAllVaultItems
} from '../controllers/vaultController';
import { protect } from '../middleware/auth';

const router = express.Router();

// All vault routes are protected
router.use(protect);

router.route('/')
  .get(getVaultItems)
  .post(createVaultItem)
  .delete(deleteAllVaultItems);

router.route('/:id')
  .get(getVaultItem)
  .put(updateVaultItem)
  .delete(deleteVaultItem);

export default router;