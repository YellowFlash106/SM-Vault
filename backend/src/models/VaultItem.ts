 // backend/src/models/VaultItem.ts

import mongoose, { Document, Schema } from 'mongoose';

/**
 * VaultItem Model - Stores ONLY encrypted data
 * The server never sees or stores plaintext passwords
 */

export interface IVaultItem extends Document {
  userId: mongoose.Types.ObjectId;
  encryptedData: {
    encrypted: string;
    salt: string;
    iv: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const VaultItemSchema = new Schema<IVaultItem>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    encryptedData: {
      encrypted: {
        type: String,
        required: true
      },
      salt: {
        type: String,
        required: true
      },
      iv: {
        type: String,
        required: true
      }
    }
  },
  {
    timestamps: true
  }
);

// Index for faster queries
VaultItemSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model<IVaultItem>('VaultItem', VaultItemSchema);