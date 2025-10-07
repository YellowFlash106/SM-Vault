// frontend/src/lib/crypto.ts

/**
 * Client-side encryption using Web Crypto API
 * 
 * Encryption Strategy:
 * - AES-GCM 256-bit encryption for vault data
 * - PBKDF2 with 100,000 iterations for key derivation
 * - Random salt and IV for each encryption operation
 * - Zero-knowledge architecture: server never sees plaintext
 */

export interface EncryptedData {
  encrypted: string;  // Base64 encoded encrypted data
  salt: string;       // Base64 encoded salt
  iv: string;         // Base64 encoded initialization vector
}

export interface VaultItem {
  title: string;
  username: string;
  password: string;
  url: string;
  notes: string;
}

/**
 * Derive encryption key from master password using PBKDF2
 */
async function deriveKey(
  masterPassword: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  
  // Import the master password as key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(masterPassword),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );
  
  // Derive AES-GCM key using PBKDF2
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,  // High iteration count for security
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt vault item data
 */
export async function encryptVaultItem(
  data: VaultItem,
  masterPassword: string
): Promise<EncryptedData> {
  const encoder = new TextEncoder();
  
  // Generate random salt and IV
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  // Derive encryption key
  const key = await deriveKey(masterPassword, salt);
  
  // Encrypt the data
  const encrypted = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv
    },
    key,
    encoder.encode(JSON.stringify(data))
  );
  
  // Convert to base64 for storage
  return {
    encrypted: arrayBufferToBase64(encrypted),
    salt: arrayBufferToBase64(salt),
    iv: arrayBufferToBase64(iv)
  };
}

/**
 * Decrypt vault item data
 */
export async function decryptVaultItem(
  encryptedData: EncryptedData,
  masterPassword: string
): Promise<VaultItem> {
  const decoder = new TextDecoder();
  
  // Convert from base64
  const salt = base64ToArrayBuffer(encryptedData.salt);
  const iv = base64ToArrayBuffer(encryptedData.iv);
  const encrypted = base64ToArrayBuffer(encryptedData.encrypted);
  
  // Derive decryption key
  const key = await deriveKey(masterPassword, salt);
  
  // Decrypt the data
  const decrypted = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv
    },
    key,
    encrypted
  );
  
  // Parse and return the data
  return JSON.parse(decoder.decode(decrypted));
}

/**
 * Generate cryptographically secure random password
 */
export interface PasswordOptions {
  length: number;
  includeNumbers: boolean;
  includeSymbols: boolean;
  excludeAmbiguous: boolean;
}

export function generateSecurePassword(options: PasswordOptions): string {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  const ambiguous = 'il1Lo0O';
  
  // Build character set
  let charset = lowercase + uppercase;
  if (options.includeNumbers) charset += numbers;
  if (options.includeSymbols) charset += symbols;
  
  // Remove ambiguous characters if requested
  if (options.excludeAmbiguous) {
    charset = charset.split('').filter(c => !ambiguous.includes(c)).join('');
  }
  
  // Generate password using crypto.getRandomValues for security
  let password = '';
  const randomValues = new Uint32Array(options.length);
  crypto.getRandomValues(randomValues);
  
  for (let i = 0; i < options.length; i++) {
    password += charset[randomValues[i] % charset.length];
  }
  
  return password;
}

/**
 * Hash password for authentication (client-side pre-hash)
 * Note: This is NOT for vault encryption, only for auth
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return arrayBufferToBase64(hash);
}

/**
 * Validate master password strength
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (password.length < 12) {
    errors.push('Password must be at least 12 characters long');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain lowercase letters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain uppercase letters');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain numbers');
  }
  if (!/[^a-zA-Z0-9]/.test(password)) {
    errors.push('Password must contain special characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Utility function: Convert ArrayBuffer to Base64 string
 */
function arrayBufferToBase64(buffer: ArrayBuffer | ArrayBufferView): string {
  // Normalize to Uint8Array view
  const bytes = buffer instanceof ArrayBuffer
    ? new Uint8Array(buffer)
    : new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);

  let binary = '';
  const chunkSize = 0x8000; // safe chunk to avoid call stack issues
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, Array.from(chunk));
  }
  return btoa(binary);
}

/**
 * Utility function: Convert Base64 string to Uint8Array
 */
function base64ToArrayBuffer(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
/**
 * Generate a random encryption key (for testing/demo purposes)
 */
export async function generateRandomKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256
    },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Calculate password entropy (bits of randomness)
 */
export function calculatePasswordEntropy(password: string): number {
  let charsetSize = 0;
  
  if (/[a-z]/.test(password)) charsetSize += 26;
  if (/[A-Z]/.test(password)) charsetSize += 26;
  if (/[0-9]/.test(password)) charsetSize += 10;
  if (/[^a-zA-Z0-9]/.test(password)) charsetSize += 32; // Approximate
  
  return Math.log2(Math.pow(charsetSize, password.length));
}

/**
 * Estimate time to crack password (in years)
 */
export function estimateTimeToCrack(password: string): {
  entropy: number;
  timeToCrack: string;
  strength: 'Very Weak' | 'Weak' | 'Moderate' | 'Strong' | 'Very Strong';
} {
  const entropy = calculatePasswordEntropy(password);
  const guessesPerSecond = 1e9; // 1 billion guesses per second
  const secondsToCrack = Math.pow(2, entropy) / guessesPerSecond;
  const yearsToCrack = secondsToCrack / (365.25 * 24 * 60 * 60);
  
  let timeToCrack: string;
  let strength: 'Very Weak' | 'Weak' | 'Moderate' | 'Strong' | 'Very Strong';
  
  if (yearsToCrack < 0.001) {
    timeToCrack = 'Instantly';
    strength = 'Very Weak';
  } else if (yearsToCrack < 1) {
    timeToCrack = `${Math.round(yearsToCrack * 365)} days`;
    strength = 'Weak';
  } else if (yearsToCrack < 1000) {
    timeToCrack = `${Math.round(yearsToCrack)} years`;
    strength = 'Moderate';
  } else if (yearsToCrack < 1000000) {
    timeToCrack = `${Math.round(yearsToCrack / 1000)}K years`;
    strength = 'Strong';
  } else {
    timeToCrack = `${Math.round(yearsToCrack / 1000000)}M years`;
    strength = 'Very Strong';
  }
  
  return {
    entropy: Math.round(entropy),
    timeToCrack,
    strength
  };
}

/**
 * Export vault data (encrypted)
 */
export async function exportVaultData(
  items: VaultItem[],
  masterPassword: string
): Promise<string> {
  const exportData = {
    version: 1,
    timestamp: new Date().toISOString(),
    items: await Promise.all(
      items.map(item => encryptVaultItem(item, masterPassword))
    )
  };
  
  return JSON.stringify(exportData, null, 2);
}

/**
 * Import vault data (decrypt)
 */
export async function importVaultData(
  exportedData: string,
  masterPassword: string
): Promise<VaultItem[]> {
  try {
    const data = JSON.parse(exportedData);
    
    if (!data.version || !data.items) {
      throw new Error('Invalid export file format');
    }
    
    const items = await Promise.all(
      data.items.map((encryptedItem: EncryptedData) => 
        decryptVaultItem(encryptedItem, masterPassword)
      )
    );
    
    return items;
  } catch (error) {
    throw new Error('Failed to import vault data. Check your master password.');
  }
}

/**
 * Check if Web Crypto API is available
 */
export function isCryptoAvailable(): boolean {
  return typeof window !== 'undefined' && 
         typeof window.crypto !== 'undefined' && 
         typeof window.crypto.subtle !== 'undefined';
}

/**
 * Generate a secure random ID
 */
export function generateSecureId(length: number = 16): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}