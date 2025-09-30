/**
 * @module entities/user/model
 * @description User entity hook
 */

import { useQuery } from '@tanstack/react-query';
import { getUserProfile } from '../api/userApi.js';
import type { UserProfile } from '@/shared/lib/auth/types.js';

/**
 * Hook to get current user's profile
 */
export function useCurrentUser(userId: string | undefined) {
  return useQuery<UserProfile | null>({
    queryKey: ['user', 'profile', userId],
    queryFn: () => (userId ? getUserProfile(userId) : null),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
