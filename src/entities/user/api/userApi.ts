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
      // Add timeout to prevent infinite hang - 10s for initial load
      const fetchPromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Profile fetch timeout after 10 seconds')), 10000);
      });

      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]);

      if (error) {
        console.error('Error fetching user profile:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Fatal error fetching profile:', error);
      throw error;
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
