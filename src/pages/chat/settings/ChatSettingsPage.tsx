/**
 * @module pages/chat/settings/ChatSettingsPage
 * @description Settings page for Mind2Flow chat integration
 */

import { useState, useEffect } from 'react';
import { Save, TestTube2, Copy, Check, Settings as SettingsIcon, Loader2 } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Switch } from '@/shared/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Separator } from '@/shared/ui/separator';
import { useChatSettings, useUpdateChatSettings, useTestConnection } from '@/entities/chat-settings';
import { useCurrentWorkspace } from '@/entities/workspace';
import { cn } from '@/shared/lib/utils/cn';

export function ChatSettingsPage() {
  const { currentWorkspace } = useCurrentWorkspace();
  const { data: settings, isLoading } = useChatSettings();
  const updateSettings = useUpdateChatSettings();
  const testConnection = useTestConnection();

  // Form state
  const [apiEndpoint, setApiEndpoint] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [autoCreateContacts, setAutoCreateContacts] = useState(true);
  const [enableNotifications, setEnableNotifications] = useState(true);
  const [isActive, setIsActive] = useState(false);

  // UI state
  const [copied, setCopied] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Webhook URL (from your Supabase Edge Function)
  const webhookUrl = currentWorkspace?.id
    ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-webhook?workspace=${currentWorkspace.id}`
    : '';

  // Load settings into form
  useEffect(() => {
    if (settings) {
      setApiEndpoint(settings.api_endpoint || '');
      setApiKey(settings.api_key || '');
      setApiSecret(settings.api_secret || '');
      setAutoCreateContacts(settings.auto_create_contacts ?? true);
      setEnableNotifications(settings.enable_notifications ?? true);
      setIsActive(settings.is_active ?? false);
      setHasChanges(false);
    }
  }, [settings]);

  // Track changes
  useEffect(() => {
    if (!settings) {
      setHasChanges(true); // New settings, always have changes
      return;
    }

    const changed =
      apiEndpoint !== (settings.api_endpoint || '') ||
      apiKey !== (settings.api_key || '') ||
      apiSecret !== (settings.api_secret || '') ||
      autoCreateContacts !== (settings.auto_create_contacts ?? true) ||
      enableNotifications !== (settings.enable_notifications ?? true) ||
      isActive !== (settings.is_active ?? false);

    setHasChanges(changed);
  }, [apiEndpoint, apiKey, apiSecret, autoCreateContacts, enableNotifications, isActive, settings]);

  const handleSave = async () => {
    try {
      await updateSettings.mutateAsync({
        api_endpoint: apiEndpoint || null,
        api_key: apiKey || null,
        api_secret: apiSecret || null,
        auto_create_contacts: autoCreateContacts,
        enable_notifications: enableNotifications,
        is_active: isActive,
      });
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const handleTestConnection = async () => {
    if (!apiEndpoint || !apiKey || !apiSecret) {
      return;
    }

    try {
      await testConnection.mutateAsync({
        apiEndpoint,
        apiKey,
        apiSecret,
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

  if (isLoading) {
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
            <h1 className="text-3xl font-bold">Chat Settings</h1>
            <p className="text-muted-foreground">Configure Mind2Flow integration</p>
          </div>
        </div>

        {/* Webhook URL Card */}
        <Card>
          <CardHeader>
            <CardTitle>Webhook URL</CardTitle>
            <CardDescription>
              Configure this URL in your Mind2Flow account to receive incoming messages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                value={webhookUrl}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyWebhook}
                className="flex-shrink-0"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            {!currentWorkspace && (
              <p className="text-sm text-destructive mt-2">
                Please select a workspace to generate webhook URL
              </p>
            )}
          </CardContent>
        </Card>

        {/* API Configuration Card */}
        <Card>
          <CardHeader>
            <CardTitle>Mind2Flow API Configuration</CardTitle>
            <CardDescription>
              Enter your Mind2Flow API credentials to enable integration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* API Endpoint */}
            <div className="space-y-2">
              <Label htmlFor="api-endpoint">API Endpoint URL</Label>
              <Input
                id="api-endpoint"
                type="url"
                placeholder="https://api.mind2flow.com"
                value={apiEndpoint}
                onChange={(e) => setApiEndpoint(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                The base URL for Mind2Flow API
              </p>
            </div>

            {/* API Key */}
            <div className="space-y-2">
              <Label htmlFor="api-key">API Key</Label>
              <Input
                id="api-key"
                type="password"
                placeholder="Enter your API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </div>

            {/* API Secret */}
            <div className="space-y-2">
              <Label htmlFor="api-secret">API Secret</Label>
              <Input
                id="api-secret"
                type="password"
                placeholder="Enter your API secret"
                value={apiSecret}
                onChange={(e) => setApiSecret(e.target.value)}
              />
            </div>

            {/* Test Connection Button */}
            <div className="pt-2">
              <Button
                variant="outline"
                onClick={handleTestConnection}
                disabled={!apiEndpoint || !apiKey || !apiSecret || testConnection.isPending}
                className="w-full sm:w-auto"
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

              {/* Test Result */}
              {testConnection.data && (
                <div
                  className={cn(
                    'mt-3 p-3 rounded-md text-sm',
                    testConnection.data.success
                      ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                  )}
                >
                  {testConnection.data.message}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* General Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>
              Configure how the chat integration behaves
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Active Toggle */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="is-active">Enable Integration</Label>
                <p className="text-sm text-muted-foreground">
                  Activate Mind2Flow chat integration
                </p>
              </div>
              <Switch
                id="is-active"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
            </div>

            <Separator />

            {/* Auto-create Contacts */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-create">Auto-create Contacts</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically create new contacts from incoming messages
                </p>
              </div>
              <Switch
                id="auto-create"
                checked={autoCreateContacts}
                onCheckedChange={setAutoCreateContacts}
              />
            </div>

            <Separator />

            {/* Enable Notifications */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifications">Browser Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Show desktop notifications for new messages
                </p>
              </div>
              <Switch
                id="notifications"
                checked={enableNotifications}
                onCheckedChange={setEnableNotifications}
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end gap-3">
          <Button
            onClick={handleSave}
            disabled={!hasChanges || updateSettings.isPending}
            size="lg"
          >
            {updateSettings.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Settings
              </>
            )}
          </Button>
        </div>

        {/* Success/Error Messages */}
        {updateSettings.isSuccess && (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400 rounded-md">
            ✓ Settings saved successfully
          </div>
        )}

        {updateSettings.isError && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400 rounded-md">
            ✗ Failed to save settings. Please try again.
          </div>
        )}
      </div>
    </div>
  );
}
