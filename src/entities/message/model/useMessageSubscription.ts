/**
 * @module entities/message/model/useMessageSubscription
 * @description Real-time subscription for new messages
 */

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/lib/supabase';
import { useCurrentWorkspace } from '@/entities/workspace';
import type { Database } from '@/shared/lib/database/types';

type MessageInsert = Database['public']['Tables']['messages']['Insert'];

/**
 * Hook to subscribe to real-time message updates
 * Automatically updates the message list when new messages arrive
 */
export function useMessageSubscription(contactId?: string) {
  const queryClient = useQueryClient();
  const { currentWorkspace } = useCurrentWorkspace();

  useEffect(() => {
    if (!currentWorkspace?.id) return;

    // Create channel for this workspace
    const channel = supabase
      .channel(`workspace:${currentWorkspace.id}:messages`)
      .on<MessageInsert>(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `workspace_id=eq.${currentWorkspace.id}`,
        },
        (payload) => {
          console.log('🔔 New message received:', payload.new);

          // Only invalidate for messages from contacts (not user's own sent messages)
          // User's sent messages are handled by optimistic updates in useSendMessage
          if (payload.new.sender_type === 'contact') {
            // Invalidate queries to refetch data
            queryClient.invalidateQueries({
              queryKey: ['messages'],
            });
          }

          // Show browser notification (optional)
          if (
            'Notification' in window &&
            Notification.permission === 'granted' &&
            payload.new.sender_type === 'contact'
          ) {
            // Only show notification if not on the current contact's chat
            if (!contactId || payload.new.contact_id !== contactId) {
              new Notification('New Message', {
                body: payload.new.content?.substring(0, 100) || 'New message received',
                icon: '/logo.svg',
              });
            }
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `workspace_id=eq.${currentWorkspace.id}`,
        },
        (payload) => {
          console.log('📝 Message updated:', payload.new);

          // Invalidate queries to refetch and show updated status
          queryClient.invalidateQueries({
            queryKey: ['messages'],
          });
        }
      )
      .subscribe((status) => {
        console.log('💬 Real-time subscription status:', status);
      });

    // Cleanup on unmount
    return () => {
      console.log('🔌 Unsubscribing from messages channel');
      supabase.removeChannel(channel);
    };
  }, [currentWorkspace?.id, contactId, queryClient]);
}
