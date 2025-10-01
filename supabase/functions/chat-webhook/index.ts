// @ts-nocheck - This is a Deno Edge Function, not a Node.js file
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WebhookPayload {
    workspace_id?: string
    contact: {
        phone?: string
        email?: string
        first_name?: string
        last_name?: string
        name?: string
    }
    message: {
        content: string
        message_type?: 'text' | 'image' | 'file' | 'audio'
        media_url?: string
    }
    timestamp?: string
}

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // Get workspace_id from query params or body
        const url = new URL(req.url)
        const workspaceIdFromQuery = url.searchParams.get('workspace')

        // Parse request body
        const payload: WebhookPayload = await req.json()
        const workspaceId = workspaceIdFromQuery || payload.workspace_id

        // Validate workspace_id
        if (!workspaceId) {
            return new Response(
                JSON.stringify({ error: 'Missing workspace_id' }),
                {
                    status: 400,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                }
            )
        }

        // Validate required fields
        if (!payload.contact || !payload.message || !payload.message.content) {
            return new Response(
                JSON.stringify({ error: 'Missing required fields: contact and message.content' }),
                {
                    status: 400,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                }
            )
        }

        // Validate phone number is required (WhatsApp integration)
        if (!payload.contact.phone) {
            return new Response(
                JSON.stringify({ error: 'Phone number is required for WhatsApp contacts' }),
                {
                    status: 400,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                }
            )
        }

        // Initialize Supabase client with service role key
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false,
                },
            }
        )

        // 1. Get workspace owner (for created_by field)
        const { data: workspace } = await supabaseClient
            .from('workspaces')
            .select('owner_id')
            .eq('id', workspaceId)
            .single()

        if (!workspace) {
            return new Response(
                JSON.stringify({ error: 'Workspace not found' }),
                {
                    status: 404,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                }
            )
        }

        const workspaceOwnerId = workspace.owner_id

        // 2. Get chat settings to check if auto-create is enabled
        const { data: settings } = await supabaseClient
            .from('chat_settings')
            .select('auto_create_contacts, is_active')
            .eq('workspace_id', workspaceId)
            .single()

        // Check if integration is active
        if (!settings?.is_active) {
            return new Response(
                JSON.stringify({ error: 'Chat integration is not active for this workspace' }),
                {
                    status: 403,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                }
            )
        }

        // 2. Find or create contact by phone number
        let contactId: string | null = null

        // Try to find existing contact by phone
        const { data: existingContact } = await supabaseClient
            .from('contacts')
            .select('id')
            .eq('workspace_id', workspaceId)
            .eq('phone', payload.contact.phone)
            .single()

        if (existingContact) {
            contactId = existingContact.id
        } else if (settings.auto_create_contacts) {
            // Auto-create contact if enabled
            const contactData = {
                workspace_id: workspaceId,
                first_name: payload.contact.first_name || payload.contact.name || 'Unknown',
                last_name: payload.contact.last_name || '',
                phone: payload.contact.phone || null,
                email: payload.contact.email || null,
                source: 'chat_webhook',
                status: 'lead',
                created_by: workspaceOwnerId, // Use workspace owner as creator
            }

            const { data: newContact, error: createError } = await supabaseClient
                .from('contacts')
                .insert(contactData)
                .select('id')
                .single()

            if (createError) {
                console.error('Error creating contact:', createError)
                return new Response(
                    JSON.stringify({ error: 'Failed to create contact', details: createError.message }),
                    {
                        status: 500,
                        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    }
                )
            }

            contactId = newContact.id
        } else {
            // Contact doesn't exist and auto-create is disabled
            return new Response(
                JSON.stringify({ error: 'Contact not found and auto-create is disabled' }),
                {
                    status: 404,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                }
            )
        }

        // 3. Insert message
        const messageData = {
            workspace_id: workspaceId,
            contact_id: contactId,
            sender_type: 'contact',
            sender_id: contactId,
            content: payload.message.content,
            message_type: payload.message.message_type || 'text',
            media_url: payload.message.media_url || null,
            status: 'delivered',
            created_at: payload.timestamp || new Date().toISOString(),
        }

        const { data: message, error: messageError } = await supabaseClient
            .from('messages')
            .insert(messageData)
            .select()
            .single()

        if (messageError) {
            console.error('Error creating message:', messageError)
            return new Response(
                JSON.stringify({ error: 'Failed to create message', details: messageError.message }),
                {
                    status: 500,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                }
            )
        }

        // 4. Return success response
        return new Response(
            JSON.stringify({
                success: true,
                message: 'Message received and stored',
                data: {
                    message_id: message.id,
                    contact_id: contactId,
                },
            }),
            {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
        )
    } catch (error) {
        console.error('Webhook error:', error)
        return new Response(
            JSON.stringify({
                error: 'Internal server error',
                details: error instanceof Error ? error.message : 'Unknown error',
            }),
            {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
        )
    }
})
