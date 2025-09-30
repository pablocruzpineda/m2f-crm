/**
 * @module shared/lib/auth/types
 * @description Type definitions for authentication
 */

import type { Session } from '@supabase/supabase-js';
import type { Tables } from '../database/types';

/**
 * User profile from database
 */
export type UserProfile = Tables<'profiles'>;

/**
 * Workspace from database
 */
export type Workspace = Tables<'workspaces'>;

/**
 * Workspace member from database
 */
export type WorkspaceMember = Tables<'workspace_members'>;

/**
 * Extended user with profile data
 */
export interface AuthUser {
  id: string;
  email: string;
  profile: UserProfile | null;
}

/**
 * Auth state
 */
export interface AuthState {
  user: AuthUser | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

/**
 * Workspace context
 */
export interface WorkspaceContext {
  currentWorkspace: Workspace | null;
  workspaces: Workspace[];
  isLoadingWorkspaces: boolean;
  switchWorkspace: (workspaceId: string) => void;
  refreshWorkspaces: () => Promise<void>;
}

/**
 * Auth error types
 */
export type AuthErrorCode =
  | 'INVALID_CREDENTIALS'
  | 'USER_NOT_FOUND'
  | 'EMAIL_NOT_CONFIRMED'
  | 'WEAK_PASSWORD'
  | 'EMAIL_ALREADY_EXISTS'
  | 'NETWORK_ERROR'
  | 'UNKNOWN_ERROR';

/**
 * Auth error
 */
export interface AuthError {
  code: AuthErrorCode;
  message: string;
}

/**
 * Login credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Signup data
 */
export interface SignupData {
  email: string;
  password: string;
  fullName: string;
  workspaceName: string;
}

/**
 * Password reset request
 */
export interface PasswordResetRequest {
  email: string;
}

/**
 * Password reset
 */
export interface PasswordReset {
  password: string;
}
