/**
 * Accept Invitation Page
 * Where users land from WhatsApp magic link to create their account
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/shared/ui/card';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Loader2, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/shared/lib/supabase/client';
import { acceptInvitation } from '@/entities/team/api/invitationApi';

export function AcceptInvitationPage() {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Invitation details
    const [invitation, setInvitation] = useState<{
        email: string;
        full_name: string;
        workspace_name: string;
        expires_at: string;
    } | null>(null);

    // Form state
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Validate token and load invitation details
    useEffect(() => {
        async function validateToken() {
            if (!token) {
                setError('Invalid invitation link');
                setLoading(false);
                return;
            }

            try {
                // Get invitation details
                const { data: invitationData, error: inviteError } = await supabase
                    .from('team_invitations')
                    .select(`
            email,
            full_name,
            expires_at,
            status,
            workspace_id
          `)
                    .eq('token', token)
                    .single();

                if (inviteError || !invitationData) {
                    setError('Invalid or expired invitation link');
                    setLoading(false);
                    return;
                }

                // Check status
                if (invitationData.status === 'accepted') {
                    setError('This invitation has already been accepted');
                    setLoading(false);
                    return;
                }

                if (invitationData.status === 'cancelled') {
                    setError('This invitation has been cancelled');
                    setLoading(false);
                    return;
                }

                if (invitationData.status === 'expired' || new Date(invitationData.expires_at) < new Date()) {
                    setError('This invitation has expired. Please request a new one.');
                    setLoading(false);
                    return;
                }

                // Get workspace name
                const { data: workspace } = await supabase
                    .from('workspaces')
                    .select('name')
                    .eq('id', invitationData.workspace_id)
                    .single();

                setInvitation({
                    email: invitationData.email,
                    full_name: invitationData.full_name,
                    workspace_name: workspace?.name || 'Unknown Workspace',
                    expires_at: invitationData.expires_at,
                });

                setLoading(false);
            } catch (err) {
                console.error('Error validating invitation:', err);
                setError('Failed to validate invitation');
                setLoading(false);
            }
        }

        validateToken();
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validation
        if (password.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (!token) {
            setError('Invalid invitation token');
            return;
        }

        setSubmitting(true);

        try {
            // Accept invitation and create account
            const result = await acceptInvitation(token, password);

            setSuccess(true);

            // Auto-login was handled by acceptInvitation via supabase.auth.signUp
            // Wait a moment then redirect to workspace
            setTimeout(() => {
                navigate(`/workspaces/${result.workspace_id}`);
            }, 2000);

        } catch (err) {
            console.error('Error accepting invitation:', err);
            setError(err instanceof Error ? err.message : 'Failed to accept invitation');
            setSubmitting(false);
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
                <Card className="w-full max-w-md">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                        <p className="text-muted-foreground">Validating your invitation...</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Error state (invalid/expired invitation)
    if (error && !invitation) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <AlertCircle className="h-8 w-8 text-destructive" />
                            <div>
                                <CardTitle>Invalid Invitation</CardTitle>
                                <CardDescription>This invitation link is not valid</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    </CardContent>
                    <CardFooter>
                        <Button variant="outline" onClick={() => navigate('/login')} className="w-full">
                            Go to Login
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    // Success state
    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <CheckCircle className="h-8 w-8 text-green-600" />
                            <div>
                                <CardTitle>Welcome Aboard!</CardTitle>
                                <CardDescription>Your account has been created successfully</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Alert>
                            <AlertDescription>
                                You've successfully joined <strong>{invitation?.workspace_name}</strong>!
                                Redirecting you to the workspace...
                            </AlertDescription>
                        </Alert>
                        <div className="flex justify-center">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Main form
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Complete Your Registration</CardTitle>
                    <CardDescription>
                        You've been invited to join <strong>{invitation?.workspace_name}</strong>
                    </CardDescription>
                </CardHeader>

                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        {/* Welcome message */}
                        <div className="space-y-2">
                            <p className="text-sm">
                                Welcome, <strong>{invitation?.full_name}</strong>! 👋
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Create a password to activate your account and start collaborating with your team.
                            </p>
                        </div>

                        {/* Email (readonly) */}
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input
                                type="email"
                                value={invitation?.email || ''}
                                disabled
                                className="bg-muted"
                            />
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Create a strong password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={submitting}
                                    required
                                    minLength={8}
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={() => setShowPassword(!showPassword)}
                                    disabled={submitting}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                        <Eye className="h-4 w-4 text-muted-foreground" />
                                    )}
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Must be at least 8 characters long
                            </p>
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Confirm your password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                disabled={submitting}
                                required
                            />
                        </div>

                        {/* Error message */}
                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        {/* Expiry notice */}
                        {invitation && (
                            <p className="text-xs text-muted-foreground text-center">
                                This invitation expires on{' '}
                                {new Date(invitation.expires_at).toLocaleDateString(undefined, {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </p>
                        )}
                    </CardContent>

                    <CardFooter className="flex flex-col space-y-2">
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={submitting || !password || !confirmPassword}
                        >
                            {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            {submitting ? 'Creating Account...' : 'Create Account & Join Workspace'}
                        </Button>

                        <p className="text-xs text-center text-muted-foreground">
                            By creating an account, you agree to our Terms of Service and Privacy Policy
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
