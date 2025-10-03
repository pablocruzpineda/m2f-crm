// eslint-disable-next-line @typescript-eslint/ban-ts-comment
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

        console.log('=== Incoming Webhook Request ===')
        console.log('URL:', req.url)
        console.log('Method:', req.method)
        console.log('Workspace ID from query:', workspaceIdFromQuery)

        // Parse request body
        const rawPayload = await req.json()
        console.log('Raw payload received:', JSON.stringify(rawPayload, null, 2))

        // Extract data from nested response structure
        let payload: WebhookPayload

        // Check if response contains nested data (Mind2Flow format)
        if (rawPayload.response && rawPayload.stdout) {
            try {
                // Parse the stdout string which contains the actual data
                const stdoutData = rawPayload.stdout.trim()
                // Remove Python-style quotes and parse
                const cleanedData = stdoutData.replace(/'/g, '"').replace(/True/g, 'true').replace(/False/g, 'false')
                const parsedData = JSON.parse(cleanedData)

                // Extract sender and message from parsed data
                const sender = parsedData.data?.sender
                const message = parsedData.data?.message

                console.log('Parsed Mind2Flow webhook:', { sender, message })

                // Transform to expected format
                // Note: Phone number is stored AS-IS from WhatsApp to ensure we can match it
                // Normalization happens when sending messages out
                payload = {
                    contact: {
                        phone: sender,
                        first_name: 'WhatsApp User',
                    },
                    message: {
                        content: message,
                        message_type: 'text',
                    },
                    timestamp: parsedData.timestamp || new Date().toISOString(),
                }
            } catch (parseError) {
                console.error('Failed to parse Mind2Flow format:', parseError)
                // Fallback to raw payload
                payload = rawPayload as WebhookPayload
            }
        } else {
            // Standard format
            payload = rawPayload as WebhookPayload
        }

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
        // Try to get workspace default settings (user_id IS NULL)
        const { data: settingsArray } = await supabaseClient
            .from('chat_settings')
            .select('auto_create_contacts, is_active')
            .eq('workspace_id', workspaceId)
            .is('user_id', null)
            .limit(1)

        const settings = settingsArray?.[0]

        console.log('Chat settings found:', settings)

        // Check if integration is active
        if (!settings?.is_active) {
            console.error('Chat integration is not active or not found for workspace:', workspaceId)
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

        console.log('Looking for contact with phone:', payload.contact.phone)

        // Try to find existing contact by phone
        const { data: existingContact, error: contactError } = await supabaseClient
            .from('contacts')
            .select('id')
            .eq('workspace_id', workspaceId)
            .eq('phone', payload.contact.phone)
            .single()

        if (contactError) {
            console.log('Contact lookup error (might be expected if not found):', contactError.message)
        }

        if (existingContact) {
            console.log('Found existing contact:', existingContact.id)
            contactId = existingContact.id
        } else if (settings.auto_create_contacts) {
            // Auto-create contact if enabled
            console.log('Auto-creating new contact...')
            const now = new Date().toISOString()
            const contactData = {
                workspace_id: workspaceId,
                first_name: payload.contact.first_name || payload.contact.name || 'Unknown',
                last_name: payload.contact.last_name || '',
                phone: payload.contact.phone || null,
                email: payload.contact.email || null,
                source: 'chat_webhook',
                status: 'lead',
                created_by: workspaceOwnerId, // Use workspace owner as creator
                assigned_to: workspaceOwnerId, // Auto-assign to workspace owner
                assigned_by: workspaceOwnerId, // Assigned by workspace owner
                assigned_at: now, // Timestamp of assignment
            }

            console.log('Contact data to insert:', contactData)

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

            console.log('Created new contact:', newContact.id)
            contactId = newContact.id
        } else {
            // Contact doesn't exist and auto-create is disabled
            console.error('Contact not found and auto-create is disabled for phone:', payload.contact.phone)
            return new Response(
                JSON.stringify({ error: 'Contact not found and auto-create is disabled' }),
                {
                    status: 404,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                }
            )
        }

        // 3. Insert message
        console.log('Creating message for contact:', contactId)
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

        console.log('Message data to insert:', messageData)

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

        console.log('Message created successfully:', message.id)

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
