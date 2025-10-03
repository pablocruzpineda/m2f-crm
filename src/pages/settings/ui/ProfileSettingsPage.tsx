/**
 * @module pages/settings/profile
 * @description User profile settings page
 */

import { useState } from 'react';
import { User, Mail, Save } from 'lucide-react';
import { toast } from 'sonner';
import { PageContainer } from '@/shared/ui/layouts/PageContainer';
import { useCurrentUser } from '@/entities/user';
import { useSession } from '@/entities/session';
import { supabase } from '@/shared/lib/supabase';
import { Skeleton } from '@/shared/ui/skeleton/LoadingSkeleton';

export function ProfileSettingsPage() {
    const { session } = useSession();
    const { data: user, isLoading, refetch } = useCurrentUser(session?.user?.id);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');

    // Initialize form when user data loads
    useState(() => {
        if (user) {
            setFullName(user.full_name || '');
            setEmail(user.email || '');
        }
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!session?.user?.id) {
            toast.error('Not authenticated');
            return;
        }

        if (!fullName.trim()) {
            toast.error('Full name is required');
            return;
        }

        setIsSubmitting(true);

        try {
            const { error } = await supabase
                .from('profiles')
                .update({ full_name: fullName.trim() })
                .eq('id', session.user.id);

            if (error) throw error;

            await refetch();
            toast.success('Profile updated successfully!');
        } catch (error) {
            console.error('Failed to update profile:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <PageContainer>
                <div className="max-w-2xl space-y-6">
                    <Skeleton className="h-10 w-64" />
                    <Skeleton className="h-96 w-full" />
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <div className="max-w-2xl space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Profile Settings</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Manage your personal account information
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="rounded-lg border bg-card p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-foreground mb-4">
                            Personal Information
                        </h2>

                        <div className="space-y-4">
                            {/* Full Name */}
                            <div>
                                <label
                                    htmlFor="fullName"
                                    className="block text-sm font-medium text-foreground mb-2"
                                >
                                    Full Name <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <input
                                        id="fullName"
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="Enter your full name"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Email (Read-only) */}
                            <div>
                                <label
                                    htmlFor="email"
                                    className="block text-sm font-medium text-foreground mb-2"
                                >
                                    Email
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        readOnly
                                        className="w-full pl-10 pr-4 py-2 border border-input rounded-lg bg-muted text-muted-foreground cursor-not-allowed"
                                        placeholder="your@email.com"
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Email cannot be changed. Contact support if you need to update it.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Save className="h-4 w-4" />
                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </PageContainer>
    );
}
