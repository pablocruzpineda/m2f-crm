/**
 * @module entities/sub-account/model
 * @description Hook to detect workspace from hostname (subdomain or custom domain)
 * This enables subdomain/custom domain routing for multi-tenant access
 */

import { useEffect } from 'react';
import { useCurrentWorkspace } from '@/entities/workspace';
import { getWorkspaceByHostname, getWorkspaceBySlug } from '../api/subAccountApi';
import type { Json } from '@/shared/lib/database/types';

/**
 * Detects workspace from current hostname and auto-loads it
 * 
 * How it works:
 * 1. Gets current hostname (e.g., "abc-corp.yourcrm.com" or "crm.abccorp.com")
 * 2. Tries to match custom_domain in database
 * 3. If no match, extracts subdomain and matches slug
 * 4. Auto-switches to detected workspace
 * 
 * @param baseDomain - Your main domain (e.g., "yourcrm.com")
 * @param enabled - Whether to enable hostname detection (default: true)
 */
export function useWorkspaceFromHostname(baseDomain: string, enabled: boolean = true) {
    const { setCurrentWorkspace } = useCurrentWorkspace();

    useEffect(() => {
        if (!enabled) return;

        const detectAndLoadWorkspace = async () => {
            try {
                const hostname = window.location.hostname;

                // Skip detection for localhost development
                if (hostname === 'localhost' || hostname === '127.0.0.1') {
                    console.log('[Hostname Detection] Skipping - localhost detected');
                    return;
                }

                console.log('[Hostname Detection] Checking hostname:', hostname);

                // Step 1: Try to match custom domain exactly
                const workspaceByDomain = await getWorkspaceByHostname(hostname);

                if (workspaceByDomain) {
                    console.log('[Hostname Detection] Matched custom domain:', hostname);
                    setCurrentWorkspace({
                        id: workspaceByDomain.id,
                        name: workspaceByDomain.name,
                        slug: workspaceByDomain.slug,
                        owner_id: workspaceByDomain.owner_id,
                        parent_workspace_id: workspaceByDomain.parent_workspace_id,
                        custom_domain: workspaceByDomain.custom_domain,
                        theme_config: workspaceByDomain.theme_config as Json,
                        logo_url: workspaceByDomain.logo_url,
                        logo_storage_path: null,
                        created_at: workspaceByDomain.created_at,
                        updated_at: workspaceByDomain.updated_at,
                    });
                    return;
                }

                // Step 2: Check if it's a subdomain (e.g., "abc-corp.yourcrm.com")
                if (hostname.endsWith(`.${baseDomain}`)) {
                    const subdomain = hostname.replace(`.${baseDomain}`, '');

                    // Skip if it's www or app (main domain)
                    if (subdomain === 'www' || subdomain === 'app' || subdomain === baseDomain) {
                        console.log('[Hostname Detection] Main domain detected, skipping');
                        return;
                    }

                    console.log('[Hostname Detection] Subdomain detected:', subdomain);

                    // Try to match slug
                    const workspaceBySlug = await getWorkspaceBySlug(subdomain);

                    if (workspaceBySlug) {
                        console.log('[Hostname Detection] Matched slug:', subdomain);
                        setCurrentWorkspace({
                            id: workspaceBySlug.id,
                            name: workspaceBySlug.name,
                            slug: workspaceBySlug.slug,
                            owner_id: workspaceBySlug.owner_id,
                            parent_workspace_id: workspaceBySlug.parent_workspace_id,
                            custom_domain: workspaceBySlug.custom_domain,
                            theme_config: workspaceBySlug.theme_config as Json,
                            logo_url: workspaceBySlug.logo_url,
                            logo_storage_path: null,
                            created_at: workspaceBySlug.created_at,
                            updated_at: workspaceBySlug.updated_at,
                        });
                        return;
                    } else {
                        console.warn('[Hostname Detection] No workspace found for subdomain:', subdomain);
                    }
                }

                // Step 3: If hostname is exactly the base domain, it's the master workspace
                if (hostname === baseDomain || hostname === `www.${baseDomain}` || hostname === `app.${baseDomain}`) {
                    console.log('[Hostname Detection] Main domain - allowing normal workspace selection');
                    return;
                }

                console.log('[Hostname Detection] No workspace matched, using default');
            } catch (error) {
                console.error('[Hostname Detection] Error detecting workspace:', error);
            }
        };

        detectAndLoadWorkspace();
    }, [baseDomain, enabled, setCurrentWorkspace]);
}
