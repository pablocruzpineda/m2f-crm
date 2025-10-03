/**
 * Updated Chat Settings Page
 * Phase 5.3 - Team Collaboration
 * 
 * Features:
 * - Workspace default WhatsApp settings (owners/admins only)
 * - Personal WhatsApp settings (all users)
 * - Team WhatsApp status (owners/admins only)
 * - Fallback logic (personal → workspace default)
 */

import { useState, useEffect } from 'react';
import { Save, TestTube2, Copy, Check, Settings as SettingsIcon, Loader2, Users, Info } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Switch } from '@/shared/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Badge } from '@/shared/ui/badge';
import { Separator } from '@/shared/ui/separator';
import {
    useWorkspaceChatSettings,
    usePersonalChatSettings,
    useUpdateWorkspaceChatSettings,
    useUpdatePersonalChatSettings,
    useTeamWhatsAppStatus,
    useTestConnection,
} from '@/entities/chat-settings';
import { useCurrentWorkspace } from '@/entities/workspace';
import { useUserRole } from '@/entities/workspace';
import { cn } from '@/shared/lib/utils/cn';

export function ChatSettingsPageNew() {
    const { currentWorkspace } = useCurrentWorkspace();
    const { canConfigureWorkspaceWhatsApp } = useUserRole();

    // Data queries
    const { data: workspaceSettings, isLoading: workspaceLoading } = useWorkspaceChatSettings();
    const { data: personalSettings, isLoading: personalLoading } = usePersonalChatSettings();
    const { data: teamStatus } = useTeamWhatsAppStatus();

    // Mutations
    const updateWorkspaceSettings = useUpdateWorkspaceChatSettings();
    const updatePersonalSettings = useUpdatePersonalChatSettings();
    const testConnection = useTestConnection();

    // Active section state
    const [activeSection, setActiveSection] = useState<'workspace' | 'personal'>('personal');

    // Workspace form state
    const [workspaceEndpoint, setWorkspaceEndpoint] = useState('');
    const [workspaceKey, setWorkspaceKey] = useState('');
    const [workspaceSecret, setWorkspaceSecret] = useState('');
    const [workspaceActive, setWorkspaceActive] = useState(false);
    const [workspaceAutoCreate, setWorkspaceAutoCreate] = useState(true);
    const [workspaceNotifications, setWorkspaceNotifications] = useState(true);
    const [workspaceHasChanges, setWorkspaceHasChanges] = useState(false);

    // Personal form state
    const [personalEndpoint, setPersonalEndpoint] = useState('');
    const [personalKey, setPersonalKey] = useState('');
    const [personalSecret, setPersonalSecret] = useState('');
    const [personalActive, setPersonalActive] = useState(false);
    const [personalAutoCreate, setPersonalAutoCreate] = useState(true);
    const [personalNotifications, setPersonalNotifications] = useState(true);
    const [personalHasChanges, setPersonalHasChanges] = useState(false);

    // UI state
    const [copied, setCopied] = useState(false);

    // Webhook URL
    const webhookUrl = currentWorkspace?.id
        ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-webhook?workspace=${currentWorkspace.id}`
        : '';

    // Load workspace settings
    useEffect(() => {
        if (workspaceSettings) {
            setWorkspaceEndpoint(workspaceSettings.api_endpoint || '');
            setWorkspaceKey(workspaceSettings.api_key || '');
            setWorkspaceSecret(workspaceSettings.api_secret || '');
            setWorkspaceActive(workspaceSettings.is_active ?? false);
            setWorkspaceAutoCreate(workspaceSettings.auto_create_contacts ?? true);
            setWorkspaceNotifications(workspaceSettings.enable_notifications ?? true);
            setWorkspaceHasChanges(false);
        }
    }, [workspaceSettings]);

    // Load personal settings
    useEffect(() => {
        if (personalSettings) {
            setPersonalEndpoint(personalSettings.api_endpoint || '');
            setPersonalKey(personalSettings.api_key || '');
            setPersonalSecret(personalSettings.api_secret || '');
            setPersonalActive(personalSettings.is_active ?? false);
            setPersonalAutoCreate(personalSettings.auto_create_contacts ?? true);
            setPersonalNotifications(personalSettings.enable_notifications ?? true);
            setPersonalHasChanges(false);
        }
    }, [personalSettings]);

    // Track workspace changes
    useEffect(() => {
        if (!workspaceSettings) {
            setWorkspaceHasChanges(true);
            return;
        }
        const changed =
            workspaceEndpoint !== (workspaceSettings.api_endpoint || '') ||
            workspaceKey !== (workspaceSettings.api_key || '') ||
            workspaceSecret !== (workspaceSettings.api_secret || '') ||
            workspaceActive !== (workspaceSettings.is_active ?? false) ||
            workspaceAutoCreate !== (workspaceSettings.auto_create_contacts ?? true) ||
            workspaceNotifications !== (workspaceSettings.enable_notifications ?? true);
        setWorkspaceHasChanges(changed);
    }, [workspaceEndpoint, workspaceKey, workspaceSecret, workspaceActive, workspaceAutoCreate, workspaceNotifications, workspaceSettings]);

    // Track personal changes
    useEffect(() => {
        if (!personalSettings) {
            setPersonalHasChanges(
                !!(personalEndpoint || personalKey || personalSecret || personalActive)
            );
            return;
        }
        const changed =
            personalEndpoint !== (personalSettings.api_endpoint || '') ||
            personalKey !== (personalSettings.api_key || '') ||
            personalSecret !== (personalSettings.api_secret || '') ||
            personalActive !== (personalSettings.is_active ?? false) ||
            personalAutoCreate !== (personalSettings.auto_create_contacts ?? true) ||
            personalNotifications !== (personalSettings.enable_notifications ?? true);
        setPersonalHasChanges(changed);
    }, [personalEndpoint, personalKey, personalSecret, personalActive, personalAutoCreate, personalNotifications, personalSettings]);

    const handleSaveWorkspace = async () => {
        await updateWorkspaceSettings.mutateAsync({
            api_endpoint: workspaceEndpoint || null,
            api_key: workspaceKey || null,
            api_secret: workspaceSecret || null,
            is_active: workspaceActive,
            auto_create_contacts: workspaceAutoCreate,
            enable_notifications: workspaceNotifications,
        });
    };

    const handleSavePersonal = async () => {
        await updatePersonalSettings.mutateAsync({
            api_endpoint: personalEndpoint || null,
            api_key: personalKey || null,
            api_secret: personalSecret || null,
            is_active: personalActive,
            auto_create_contacts: personalAutoCreate,
            enable_notifications: personalNotifications,
        });
    };

    const handleTestConnection = async (type: 'workspace' | 'personal') => {
        const endpoint = type === 'workspace' ? workspaceEndpoint : personalEndpoint;
        const key = type === 'workspace' ? workspaceKey : personalKey;
        const secret = type === 'workspace' ? workspaceSecret : personalSecret;

        if (!endpoint || !key || !secret) return;

        try {
            await testConnection.mutateAsync({
                apiEndpoint: endpoint,
                apiKey: key,
                apiSecret: secret,
            });
        } catch (error) {
            console.error('Connection test failed:', error);
        }
    };

    const handleCopyWebhook = () => {
        navigator.clipboard.writeText(webhookUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (workspaceLoading || personalLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto bg-background">
            <div className="max-w-4xl mx-auto p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <SettingsIcon className="h-8 w-8 text-primary" />
                    <div>
                        <h1 className="text-3xl font-bold">WhatsApp Settings</h1>
                        <p className="text-muted-foreground">Configure Mind2Flow integration</p>
                    </div>
                </div>

                {/* Fallback Logic Info */}
                <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                        <strong>How it works:</strong> When sending messages, the system first checks your personal settings.
                        If not configured, it falls back to the workspace default settings.
                    </AlertDescription>
                </Alert>

                {/* Section Tabs */}
                <div className="border-b border-gray-200 dark:border-gray-700">
                    <nav className="-mb-px flex space-x-8">
                        <button
                            onClick={() => setActiveSection('personal')}
                            className={cn(
                                'border-b-2 py-4 px-1 text-sm font-medium',
                                activeSection === 'personal'
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400'
                            )}
                        >
                            Personal Settings
                        </button>
                        {canConfigureWorkspaceWhatsApp && (
                            <button
                                onClick={() => setActiveSection('workspace')}
                                className={cn(
                                    'border-b-2 py-4 px-1 text-sm font-medium',
                                    activeSection === 'workspace'
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400'
                                )}
                            >
                                Workspace Default
                            </button>
                        )}
                    </nav>
                </div>

                {/* Personal Settings Section */}
                {activeSection === 'personal' && (
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>My Personal WhatsApp Configuration</CardTitle>
                                <CardDescription>
                                    Configure your personal Mind2Flow API credentials. These settings override the workspace default.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="personal-endpoint">API Endpoint URL</Label>
                                    <Input
                                        id="personal-endpoint"
                                        type="url"
                                        placeholder="https://api.mind2flow.com"
                                        value={personalEndpoint}
                                        onChange={(e) => setPersonalEndpoint(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="personal-key">API Key</Label>
                                    <Input
                                        id="personal-key"
                                        type="password"
                                        placeholder="Enter your API key"
                                        value={personalKey}
                                        onChange={(e) => setPersonalKey(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="personal-secret">API Secret</Label>
                                    <Input
                                        id="personal-secret"
                                        type="password"
                                        placeholder="Enter your API secret"
                                        value={personalSecret}
                                        onChange={(e) => setPersonalSecret(e.target.value)}
                                    />
                                </div>

                                <div className="flex items-center justify-between pt-2">
                                    <div>
                                        <Label htmlFor="personal-active">Enable Personal Settings</Label>
                                        <p className="text-sm text-muted-foreground">Use my personal API instead of workspace default</p>
                                    </div>
                                    <Switch
                                        id="personal-active"
                                        checked={personalActive}
                                        onCheckedChange={setPersonalActive}
                                    />
                                </div>

                                <Separator />

                                {/* Auto-create Contacts */}
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="personal-auto-create">Auto-create Contacts</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Automatically create new contacts from incoming messages
                                        </p>
                                    </div>
                                    <Switch
                                        id="personal-auto-create"
                                        checked={personalAutoCreate}
                                        onCheckedChange={setPersonalAutoCreate}
                                    />
                                </div>

                                <Separator />

                                {/* Enable Notifications */}
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="personal-notifications">Browser Notifications</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Show desktop notifications for new messages
                                        </p>
                                    </div>
                                    <Switch
                                        id="personal-notifications"
                                        checked={personalNotifications}
                                        onCheckedChange={setPersonalNotifications}
                                    />
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => handleTestConnection('personal')}
                                        disabled={!personalEndpoint || !personalKey || !personalSecret || testConnection.isPending}
                                    >
                                        {testConnection.isPending ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Testing...
                                            </>
                                        ) : (
                                            <>
                                                <TestTube2 className="mr-2 h-4 w-4" />
                                                Test Connection
                                            </>
                                        )}
                                    </Button>

                                    <Button
                                        onClick={handleSavePersonal}
                                        disabled={!personalHasChanges || updatePersonalSettings.isPending}
                                    >
                                        {updatePersonalSettings.isPending ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="mr-2 h-4 w-4" />
                                                Save Personal Settings
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Workspace Settings Section (Owner/Admin only) */}
                {activeSection === 'workspace' && canConfigureWorkspaceWhatsApp && (
                    <div className="space-y-6">
                        {/* Webhook URL */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Webhook URL</CardTitle>
                                <CardDescription>
                                    Configure this URL in Mind2Flow to receive incoming messages
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex gap-2">
                                    <Input value={webhookUrl} readOnly className="font-mono text-sm" />
                                    <Button variant="outline" size="icon" onClick={handleCopyWebhook}>
                                        {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Workspace API Configuration */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Workspace Default Configuration</CardTitle>
                                <CardDescription>
                                    Default API credentials used when team members don't have personal settings
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="workspace-endpoint">API Endpoint URL</Label>
                                    <Input
                                        id="workspace-endpoint"
                                        type="url"
                                        placeholder="https://api.mind2flow.com"
                                        value={workspaceEndpoint}
                                        onChange={(e) => setWorkspaceEndpoint(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="workspace-key">API Key</Label>
                                    <Input
                                        id="workspace-key"
                                        type="password"
                                        placeholder="Enter workspace API key"
                                        value={workspaceKey}
                                        onChange={(e) => setWorkspaceKey(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="workspace-secret">API Secret</Label>
                                    <Input
                                        id="workspace-secret"
                                        type="password"
                                        placeholder="Enter workspace API secret"
                                        value={workspaceSecret}
                                        onChange={(e) => setWorkspaceSecret(e.target.value)}
                                    />
                                </div>

                                <div className="flex items-center justify-between pt-2">
                                    <div>
                                        <Label htmlFor="workspace-active">Enable Workspace Default</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Activate fallback settings for team members without personal config
                                        </p>
                                    </div>
                                    <Switch
                                        id="workspace-active"
                                        checked={workspaceActive}
                                        onCheckedChange={setWorkspaceActive}
                                    />
                                </div>

                                <Separator />

                                {/* Workspace Auto-create Contacts */}
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="workspace-auto-create">Auto-create Contacts</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Default setting for team members without personal configuration
                                        </p>
                                    </div>
                                    <Switch
                                        id="workspace-auto-create"
                                        checked={workspaceAutoCreate}
                                        onCheckedChange={setWorkspaceAutoCreate}
                                    />
                                </div>

                                <Separator />

                                {/* Workspace Enable Notifications */}
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="workspace-notifications">Browser Notifications</Label>
                                        <p className="text-sm text-muted-foreground">
                                            Default setting for team members without personal configuration
                                        </p>
                                    </div>
                                    <Switch
                                        id="workspace-notifications"
                                        checked={workspaceNotifications}
                                        onCheckedChange={setWorkspaceNotifications}
                                    />
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => handleTestConnection('workspace')}
                                        disabled={!workspaceEndpoint || !workspaceKey || !workspaceSecret || testConnection.isPending}
                                    >
                                        {testConnection.isPending ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Testing...
                                            </>
                                        ) : (
                                            <>
                                                <TestTube2 className="mr-2 h-4 w-4" />
                                                Test Connection
                                            </>
                                        )}
                                    </Button>

                                    <Button
                                        onClick={handleSaveWorkspace}
                                        disabled={!workspaceHasChanges || updateWorkspaceSettings.isPending}
                                    >
                                        {updateWorkspaceSettings.isPending ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="mr-2 h-4 w-4" />
                                                Save Workspace Settings
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Team WhatsApp Status */}
                        {teamStatus && teamStatus.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="h-5 w-5" />
                                        Team WhatsApp Status
                                    </CardTitle>
                                    <CardDescription>
                                        Overview of team members with personal WhatsApp configuration
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {teamStatus.map((member) => (
                                            <div
                                                key={member.user_id}
                                                className="flex items-center justify-between p-3 rounded-lg border bg-card"
                                            >
                                                <div className="flex-1">
                                                    <p className="font-medium">
                                                        {member.profiles?.full_name || member.profiles?.email || 'Unknown'}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {member.api_endpoint || 'No endpoint configured'}
                                                    </p>
                                                </div>
                                                <Badge variant={member.is_active ? 'default' : 'outline'}>
                                                    {member.is_active ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
