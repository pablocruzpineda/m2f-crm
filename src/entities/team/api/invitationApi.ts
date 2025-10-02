/**
 * Team Invitation API
 * Handles sending and managing team member invitations
 */

import { supabase } from '@/shared/lib/supabase/client';
import type { TeamInvitation, CreateTeamInvitationInput, Json } from '@/shared/lib/database/types';
import type { Role } from '@/shared/lib/permissions';

// Generate secure token locally for now
function generateSecureToken(): string {
    const array = new Uint8Array(24);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

export interface SendInvitationParams extends CreateTeamInvitationInput {
    invitedBy: string;
}

/**
 * Send a team member invitation
 * Creates user account, profile, and sends WhatsApp invitation
 */
export async function sendTeamInvitation(params: SendInvitationParams): Promise<TeamInvitation> {
    const { workspace_id, email, full_name, phone, role, country_code, invitedBy } = params;

    // 1. Check if WhatsApp is configured for this workspace
    const { data: chatSettings } = await supabase
        .from('chat_settings')
        .select('is_active, api_key, api_secret, api_endpoint, config')
        .eq('workspace_id', workspace_id)
        .eq('user_id', invitedBy)
        .maybeSingle();

    if (!chatSettings?.is_active || !chatSettings?.api_key || !chatSettings?.api_endpoint) {
        throw new Error('WhatsApp integration is not enabled. Please configure WhatsApp settings first.');
    }

    // 2. Check if user already exists
    const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .maybeSingle();

    if (existingUser) {
        throw new Error('A user with this email already exists. Use the "Add Existing Member" option instead.');
    }

    // 3. Check for existing pending invitation
    const { data: existingInvitation } = await supabase
        .from('team_invitations')
        .select('id, status')
        .eq('workspace_id', workspace_id)
        .eq('email', email)
        .eq('status', 'pending')
        .maybeSingle();

    if (existingInvitation) {
        throw new Error('An invitation has already been sent to this email. You can resend it from the invitations list.');
    }

    // 4. Generate secure token for magic link
    const token = generateSecureToken();

    // 5. Create invitation record
    const { data: invitation, error: inviteError } = await supabase
        .from('team_invitations')
        .insert({
            workspace_id,
            email,
            full_name,
            phone: `${country_code}${phone}`,
            role,
            invited_by: invitedBy,
            token,
            status: 'pending',
        })
        .select()
        .single();

    if (inviteError) throw inviteError;

    // 6. Send WhatsApp invitation
    try {
        await sendWhatsAppInvitation({
            phone: `${country_code}${phone}`,
            full_name,
            workspace_name: await getWorkspaceName(workspace_id),
            magic_link: `${window.location.origin}/accept-invitation/${token}`,
            chatSettings: {
                api_endpoint: chatSettings.api_endpoint!,
                api_key: chatSettings.api_key!,
                api_secret: chatSettings.api_secret,
                config: chatSettings.config,
            },
        });
    } catch (whatsappError) {
        // If WhatsApp fails, mark invitation as failed but don't throw
        console.error('Failed to send WhatsApp invitation:', whatsappError);

        // Update invitation status
        await supabase
            .from('team_invitations')
            .update({
                status: 'pending',
                updated_at: new Date().toISOString()
            })
            .eq('id', invitation.id);

        throw new Error('Invitation created but WhatsApp message failed to send. Please resend the invitation.');
    }

    // 7. Log activity
    await logActivity({
        workspace_id,
        user_id: invitedBy,
        action: 'member_added',
        entity_type: 'member',
        details: {
            email,
            full_name,
            role,
            invitation_sent: true,
        },
    });

    return invitation as TeamInvitation;
}

/**
 * Resend an invitation
 */
export async function resendInvitation(invitationId: string): Promise<void> {
    // 1. Get invitation
    const { data: invitation, error } = await supabase
        .from('team_invitations')
        .select('*')
        .eq('id', invitationId)
        .single();

    if (error || !invitation) {
        throw new Error('Invitation not found');
    }

    if (invitation.status !== 'pending') {
        throw new Error('Can only resend pending invitations');
    }

    // 2. Get WhatsApp settings
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: chatSettings } = await supabase
        .from('chat_settings')
        .select('is_active, api_key, api_secret, api_endpoint, config')
        .eq('workspace_id', invitation.workspace_id)
        .eq('user_id', invitation.invited_by)
        .maybeSingle();

    if (!chatSettings?.is_active || !chatSettings?.api_key || !chatSettings?.api_endpoint) {
        throw new Error('WhatsApp integration is not configured or active');
    }

    // 3. Check if expired and extend expiry
    const now = new Date();
    const expiresAt = new Date(invitation.expires_at);

    if (expiresAt < now) {
        // Extend expiry by 7 days from now
        await supabase
            .from('team_invitations')
            .update({
                expires_at: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                updated_at: now.toISOString(),
            })
            .eq('id', invitationId);
    }

    // 4. Resend WhatsApp message
    await sendWhatsAppInvitation({
        phone: invitation.phone,
        full_name: invitation.full_name,
        workspace_name: await getWorkspaceName(invitation.workspace_id),
        magic_link: `${window.location.origin}/accept-invitation/${invitation.token}`,
        chatSettings: {
            api_endpoint: chatSettings.api_endpoint,
            api_key: chatSettings.api_key,
            api_secret: chatSettings.api_secret,
            config: chatSettings.config,
        },
    });

    // 5. Log activity (user already retrieved above)
    if (user) {
        await logActivity({
            workspace_id: invitation.workspace_id,
            user_id: user.id,
            action: 'member_added',
            entity_type: 'member',
            details: {
                email: invitation.email,
                full_name: invitation.full_name,
                invitation_resent: true,
            },
        });
    }
}

/**
 * Cancel an invitation
 */
export async function cancelInvitation(invitationId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: invitation } = await supabase
        .from('team_invitations')
        .select('workspace_id, email')
        .eq('id', invitationId)
        .single();

    await supabase
        .from('team_invitations')
        .update({
            status: 'cancelled',
            updated_at: new Date().toISOString(),
        })
        .eq('id', invitationId);

    if (invitation) {
        await logActivity({
            workspace_id: invitation.workspace_id,
            user_id: user.id,
            action: 'member_removed',
            entity_type: 'member',
            details: {
                email: invitation.email,
                invitation_cancelled: true,
            },
        });
    }
}

/**
 * Get all invitations for a workspace
 */
export async function getTeamInvitations(workspaceId: string): Promise<TeamInvitation[]> {
    const { data, error } = await supabase
        .from('team_invitations')
        .select('*')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false });

    if (error) throw error;

    return data as TeamInvitation[];
}

/**
 * Accept an invitation (called from invitation acceptance page)
 */
export async function acceptInvitation(token: string, password: string): Promise<{ email: string; workspace_id: string }> {
    // 1. Validate token and get invitation
    const { data: invitation, error } = await supabase
        .from('team_invitations')
        .select('*')
        .eq('token', token)
        .eq('status', 'pending')
        .single();

    if (error || !invitation) {
        throw new Error('Invalid or expired invitation');
    }

    // 2. Check expiry
    if (new Date(invitation.expires_at) < new Date()) {
        await supabase
            .from('team_invitations')
            .update({ status: 'expired', updated_at: new Date().toISOString() })
            .eq('id', invitation.id);

        throw new Error('This invitation has expired. Please request a new one.');
    }

    // 3. Create user account
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: invitation.email,
        password,
        options: {
            data: {
                full_name: invitation.full_name,
            },
        },
    });

    if (signUpError) throw signUpError;
    if (!authData.user) throw new Error('Failed to create user account');

    // 4. Create profile (if not auto-created by trigger)
    const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
            id: authData.user.id,
            email: invitation.email,
            full_name: invitation.full_name,
        });

    if (profileError) console.error('Profile creation error:', profileError);

    // 5. Add to workspace
    await supabase
        .from('workspace_members')
        .insert({
            workspace_id: invitation.workspace_id,
            user_id: authData.user.id,
            role: invitation.role as Role,
        });

    // 6. Mark invitation as accepted
    await supabase
        .from('team_invitations')
        .update({
            status: 'accepted',
            accepted_at: new Date().toISOString(),
            user_id: authData.user.id,
            updated_at: new Date().toISOString(),
        })
        .eq('id', invitation.id);

    return {
        email: invitation.email,
        workspace_id: invitation.workspace_id,
    };
}

/**
 * Send WhatsApp invitation message
 */
async function sendWhatsAppInvitation(params: {
    phone: string;
    full_name: string;
    workspace_name: string;
    magic_link: string;
    chatSettings: {
        api_endpoint: string;
        api_key: string;
        api_secret?: string | null;
        config?: Json | null;
    };
}): Promise<void> {
    const { phone, full_name, workspace_name, magic_link, chatSettings } = params;

    const message = `Hi ${full_name}! 👋

You've been invited to join *${workspace_name}* on our CRM platform.

To accept the invitation and create your account, click the link below:
${magic_link}

This invitation expires in 7 days.

Welcome aboard! 🎉`;

    // Use the configured external endpoint from chat_settings
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    // Add authentication headers if configured
    if (chatSettings.api_key) {
        headers['X-API-Key'] = chatSettings.api_key;
    }
    if (chatSettings.api_secret) {
        headers['X-API-Secret'] = chatSettings.api_secret;
    }

    const response = await fetch(chatSettings.api_endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            phone,
            message,
        }),
    });

    if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`Failed to send WhatsApp message: ${response.status} - ${errorText}`);
    }
}

/**
 * Get workspace name
 */
async function getWorkspaceName(workspaceId: string): Promise<string> {
    const { data } = await supabase
        .from('workspaces')
        .select('name')
        .eq('id', workspaceId)
        .single();

    return data?.name || 'Unknown Workspace';
}

/**
 * Log activity helper
 */
async function logActivity(params: {
    workspace_id: string;
    user_id: string;
    action: string;
    entity_type: string;
    details?: Record<string, unknown>;
}): Promise<void> {
    try {
        await supabase.from('activity_log').insert({
            workspace_id: params.workspace_id,
            user_id: params.user_id,
            action: params.action,
            entity_type: params.entity_type,
            details: params.details as never,
        });
    } catch (error) {
        console.error('Failed to log activity:', error);
    }
}
