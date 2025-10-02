/**
 * Cryptographic utilities
 */

/**
 * Generate a secure random token for invitations
 * @returns A URL-safe random string (32 characters)
 */
export function generateSecureToken(): string {
    const array = new Uint8Array(24);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate a shorter token (for OTP, etc.)
 * @param length Number of digits (default: 6)
 */
export function generateNumericToken(length: number = 6): string {
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    return Math.floor(min + Math.random() * (max - min + 1)).toString();
}
