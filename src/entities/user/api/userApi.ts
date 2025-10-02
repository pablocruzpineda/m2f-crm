/**
 * @module entities/user/api
 * @description API functions for user operations
 */

import { supabase } from '@/shared/lib/supabase/client.js';
import type { UserProfile } from '@/shared/lib/auth/types.js';

/**
 * Get current user's profile
 */
// Cache to prevent duplicate concurrent requests
const profileCache = new Map<string, Promise<UserProfile | null>>();

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  // Return cached promise if already fetching
  if (profileCache.has(userId)) {
    return profileCache.get(userId)!;
  }

  const profilePromise = (async () => {
    try {
      // Shorter timeout (5s) with better error handling
      const fetchPromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle(); // Use maybeSingle instead of single to avoid errors if not found

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Profile fetch timeout after 5 seconds')), 5000);
      });

      const result = await Promise.race([fetchPromise, timeoutPromise]);

      // Check for errors
      if (result.error) {
        console.error('Error fetching user profile:', result.error);
        // Don't throw on profile not found - return null instead
        if (result.error.code === 'PGRST116') {
          return null;
        }
        throw result.error;
      }

      return result.data;
    } catch (error) {
      console.error('Fatal error fetching profile:', error);
      // Return null instead of throwing to prevent blocking the UI
      return null;
    } finally {
      // Clear cache after request completes (success or failure)
      profileCache.delete(userId);
    }
  })();

  // Cache the promise
  profileCache.set(userId, profilePromise);

  return profilePromise;
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<Pick<UserProfile, 'full_name' | 'avatar_url'>>
): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }

  return data;
}
