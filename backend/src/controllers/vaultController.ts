 // backend/src/controllers/vaultController.ts

import { Request, Response, NextFunction } from 'express';
import VaultItem from '../models/VaultItem';
import { IUser } from '../models/User';

interface AuthRequest extends Request {
  user?: IUser;
}

/**
 * @route   POST /api/vault
 * @desc    Create a new vault item
 * @access  Private
 */
export const createVaultItem = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { encryptedData } = req.body;
    const userId = req.user?._id;

    // Validation
    if (!encryptedData || !encryptedData.encrypted || !encryptedData.salt || !encryptedData.iv) {
      res.status(400).json({
        success: false,
        message: 'Invalid encrypted data format'
      });
      return;
    }

    // Create vault item
    const vaultItem = await VaultItem.create({
      userId,
      encryptedData
    });

    res.status(201).json({
      success: true,
      message: 'Vault item created successfully',
      data: {
        item: vaultItem
      }
    });
  } catch (error: any) {
    console.error('Create vault item error:', error);
    next(error);
  }
};

/**
 * @route   GET /api/vault
 * @desc    Get all vault items for current user
 * @access  Private
 */
export const getVaultItems = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?._id;
    
    const vaultItems = await VaultItem.find({ userId })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        items: vaultItems,
        count: vaultItems.length
      }
    });
  } catch (error: any) {
    console.error('Get vault items error:', error);
    next(error);
  }
};

/**
 * @route   GET /api/vault/:id
 * @desc    Get single vault item
 * @access  Private
 */
export const getVaultItem = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    const vaultItem = await VaultItem.findOne({
      _id: id,
      userId
    });

    if (!vaultItem) {
      res.status(404).json({
        success: false,
        message: 'Vault item not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        item: vaultItem
      }
    });
  } catch (error: any) {
    console.error('Get vault item error:', error);
    next(error);
  }
};

/**
 * @route   PUT /api/vault/:id
 * @desc    Update vault item
 * @access  Private
 */
export const updateVaultItem = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { encryptedData } = req.body;
    const userId = req.user?._id;

    // Validation
    if (!encryptedData || !encryptedData.encrypted || !encryptedData.salt || !encryptedData.iv) {
      res.status(400).json({
        success: false,
        message: 'Invalid encrypted data format'
      });
      return;
    }

    // Find and update
    const vaultItem = await VaultItem.findOneAndUpdate(
      { _id: id, userId },
      { encryptedData },
      { new: true, runValidators: true }
    );

    if (!vaultItem) {
      res.status(404).json({
        success: false,
        message: 'Vault item not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Vault item updated successfully',
      data: {
        item: vaultItem
      }
    });
  } catch (error: any) {
    console.error('Update vault item error:', error);
    next(error);
  }
};

/**
 * @route   DELETE /api/vault/:id
 * @desc    Delete vault item
 * @access  Private
 */
export const deleteVaultItem = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    const vaultItem = await VaultItem.findOneAndDelete({
      _id: id,
      userId
    });

    if (!vaultItem) {
      res.status(404).json({
        success: false,
        message: 'Vault item not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Vault item deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete vault item error:', error);
    next(error);
  }
};

/**
 * @route   DELETE /api/vault
 * @desc    Delete all vault items for current user
 * @access  Private
 */
export const deleteAllVaultItems = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?._id;

    const result = await VaultItem.deleteMany({ userId });

    res.status(200).json({
      success: true,
      message: `Deleted ${result.deletedCount} vault items`
    });
  } catch (error: any) {
    console.error('Delete all vault items error:', error);
    next(error);
  }
};