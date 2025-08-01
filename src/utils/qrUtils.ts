import CryptoJS from 'crypto-js';

// Secret key for hashing - in production, this should be environment variable
const HASH_SECRET = 'logator_qr_secret_2024';

/**
 * Generate a secure hash for QR code using format: logator:userid
 * @param userId - The user ID to hash
 * @returns Hashed string that can be safely displayed in QR codes
 */
export const generateQRHash = (userId: number | string): string => {
  const data = `logator:${userId}`;
  const hash = CryptoJS.HmacSHA256(data, HASH_SECRET).toString(CryptoJS.enc.Hex);
  
  // Take first 12 characters for a shorter, more manageable hash
  const shortHash = hash.substring(0, 12);
  
  // Return format: LOGATOR-{shortHash}
  return `LOGATOR-${shortHash.toUpperCase()}`;
};

/**
 * Generate QR code value for a user
 * @param userId - The user ID
 * @returns The complete QR code value
 */
export const generateQRValue = (userId: number | string): string => {
  const qrHash = generateQRHash(userId);
  return qrHash; // Just return the hash, no URL needed
};

/**
 * Validate if a scanned QR code is in the correct Logator format
 * @param qrData - The scanned QR data
 * @returns boolean indicating if it's a valid Logator QR code
 */
export const isValidLogatorQR = (qrData: string): boolean => {
  return /^LOGATOR-[A-F0-9]{12}$/.test(qrData);
};

/**
 * Extract the hash from a Logator QR code
 * @param qrData - The scanned QR data
 * @returns The hash part or null if invalid
 */
export const extractQRHash = (qrData: string): string | null => {
  if (!isValidLogatorQR(qrData)) {
    return null;
  }
  return qrData.replace('LOGATOR-', '');
};