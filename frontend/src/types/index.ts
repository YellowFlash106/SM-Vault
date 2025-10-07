 // frontend/src/types/index.ts

export interface User {
  id: string;
  email: string;
  createdAt?: string;
}

export interface VaultItem {
  title: string;
  username: string;
  password: string;
  url: string;
  notes: string;
}

export interface EncryptedData {
  encrypted: string;
  salt: string;
  iv: string;
}

export interface VaultItemWithId {
  id: string;
  encryptedData: EncryptedData;
  decryptedData?: VaultItem;
  createdAt: string;
  updatedAt: string;
}

export interface PasswordGeneratorOptions {
  length: number;
  includeNumbers: boolean;
  includeSymbols: boolean;
  excludeAmbiguous: boolean;
}