/**
 * @module shared/lib/auth/errors
 * @description Authentication error handling utilities
 */

import type { AuthError, AuthErrorCode } from './types.js';

/**
 * Error messages by code
 */
export const AUTH_ERROR_MESSAGES: Record<AuthErrorCode, string> = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  USER_NOT_FOUND: 'No account found with this email',
  EMAIL_NOT_CONFIRMED: 'Please verify your email before logging in',
  WEAK_PASSWORD: 'Password is too weak',
  EMAIL_ALREADY_EXISTS: 'An account with this email already exists',
  NETWORK_ERROR: 'Network error. Please check your connection',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again',
};

/**
 * Map Supabase error to auth error code
 */
export function mapSupabaseError(error: unknown): AuthError {
  // If it's already an AuthError, return it
  if (isAuthError(error)) {
    return error;
  }

  // Handle Supabase errors
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = String(error.message).toLowerCase();

    if (message.includes('invalid login credentials')) {
      return createAuthError('INVALID_CREDENTIALS');
    }

    if (message.includes('email not confirmed')) {
      return createAuthError('EMAIL_NOT_CONFIRMED');
    }

    if (message.includes('user already registered')) {
      return createAuthError('EMAIL_ALREADY_EXISTS');
    }

    if (message.includes('password') && message.includes('weak')) {
      return createAuthError('WEAK_PASSWORD');
    }

    if (message.includes('network') || message.includes('fetch')) {
      return createAuthError('NETWORK_ERROR');
    }
  }

  return createAuthError('UNKNOWN_ERROR');
}

/**
 * Create auth error
 */
export function createAuthError(code: AuthErrorCode): AuthError {
  return {
    code,
    message: AUTH_ERROR_MESSAGES[code],
  };
}

/**
 * Type guard for auth error
 */
export function isAuthError(error: unknown): error is AuthError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error
  );
}
