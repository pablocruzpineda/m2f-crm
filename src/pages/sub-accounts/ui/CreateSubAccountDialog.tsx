/**
 * @module pages/sub-accounts
 * @description Dialog for creating new sub-accounts
 */

import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateSubAccount } from '@/entities/sub-account';
import { Button } from '@/shared/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/shared/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert';
import { Info } from 'lucide-react';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/shared/ui/form';
import { Input } from '@/shared/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/ui/select';
import { supabase } from '@/shared/lib/supabase/client';
import { useQuery } from '@tanstack/react-query';

const subAccountSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    slug: z
        .string()
        .min(2, 'Slug must be at least 2 characters')
        .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
    admin_user_id: z.string().min(1, 'Please select an administrator'),
    custom_domain: z
        .string()
        .optional()
        .refine(
            (val) => {
                if (!val || val.trim() === '') return true;
                // Basic domain validation: alphanumeric, dots, hyphens
                const domainRegex = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/i;
                return domainRegex.test(val.trim());
            },
            { message: 'Please enter a valid domain (e.g., crm.yourclient.com)' }
        ),
});

type SubAccountFormData = z.infer<typeof subAccountSchema>;

interface CreateSubAccountDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    masterWorkspaceId: string;
    masterOwnerId: string;
}

export function CreateSubAccountDialog({
    open,
    onOpenChange,
    masterWorkspaceId,
    masterOwnerId,
}: CreateSubAccountDialogProps) {
    const createSubAccount = useCreateSubAccount();

    // refs for scrolling to the DNS instructions when custom domain is entered
    const scrollRef = useRef<HTMLDivElement | null>(null);
    const alertRef = useRef<HTMLDivElement | null>(null);

    // Fetch team members (excluding the master owner)
    const { data: teamMembers, isLoading: isLoadingMembers } = useQuery({
        queryKey: ['team-members', masterWorkspaceId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('workspace_members')
                .select(`
          user_id,
          role,
          profiles!workspace_members_user_id_fkey (
            id,
            email,
            full_name
          )
        `)
                .eq('workspace_id', masterWorkspaceId)
                .neq('user_id', masterOwnerId); // Exclude master owner

            if (error) throw error;

            return data
                .filter((member) => member.profiles)
                .map((member) => ({
                    id: member.user_id,
                    email: member.profiles.email,
                    full_name: member.profiles.full_name,
                    role: member.role,
                }));
        },
        enabled: open,
    });

    const form = useForm<SubAccountFormData>({
        resolver: zodResolver(subAccountSchema),
        defaultValues: {
            name: '',
            slug: '',
            admin_user_id: '',
            custom_domain: '',
        },
    });

    // Watch custom_domain so we can auto-scroll the alert into view when populated
    const customDomain = form.watch('custom_domain');

    useEffect(() => {
        if (customDomain?.trim() && alertRef.current && scrollRef.current) {
            // Smoothly scroll the alert into view inside the scrollable container
            // Use scrollIntoView on the alert element so browser handles exact position
            try {
                alertRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            } catch {
                // fallback: set scrollTop to bottom
                if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            }
        }
    }, [customDomain]);

    // Auto-generate slug from name
    const handleNameChange = (name: string) => {
        const slug = name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
        form.setValue('slug', slug);
    };

    const onSubmit = async (data: SubAccountFormData) => {
        try {
            await createSubAccount.mutateAsync({
                master_workspace_id: masterWorkspaceId,
                name: data.name,
                slug: data.slug,
                admin_user_id: data.admin_user_id,
                custom_domain: data.custom_domain || null,
            });

            // Reset form and close dialog
            form.reset();
            onOpenChange(false);
        } catch (error) {
            console.error('Failed to create sub-account:', error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Create Sub-Account</DialogTitle>
                    <DialogDescription>
                        Create a new sub-account workspace for a client. The selected administrator will have
                        full control over their sub-account.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto pr-1" ref={scrollRef}>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            {/* Sub-Account Name */}
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Sub-Account Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Client ABC Corp"
                                                {...field}
                                                onChange={(e) => {
                                                    field.onChange(e);
                                                    handleNameChange(e.target.value);
                                                }}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            The name of the client or sub-account workspace
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Slug */}
                            <FormField
                                control={form.control}
                                name="slug"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Slug</FormLabel>
                                        <FormControl>
                                            <Input placeholder="client-abc-corp" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            URL-friendly identifier (auto-generated, but you can edit)
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Administrator Selection */}
                            <FormField
                                control={form.control}
                                name="admin_user_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Administrator</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select an administrator" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {isLoadingMembers ? (
                                                    <SelectItem value="_loading" disabled>
                                                        Loading team members...
                                                    </SelectItem>
                                                ) : teamMembers && teamMembers.length > 0 ? (
                                                    teamMembers.map((member) => (
                                                        <SelectItem key={member.id} value={member.id}>
                                                            {member.full_name || member.email} ({member.email})
                                                        </SelectItem>
                                                    ))
                                                ) : (
                                                    <SelectItem value="_empty" disabled>
                                                        No team members available
                                                    </SelectItem>
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>
                                            Select a team member to be the administrator of this sub-account.
                                            They will have full control and can customize the appearance.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Custom Domain */}
                            <FormField
                                control={form.control}
                                name="custom_domain"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Custom Domain (Optional)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="crm.clientdomain.com" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            If the client wants to use their own domain, enter it here.
                                            Otherwise, they'll use: {form.watch('slug') || 'client-slug'}.yourcrm.com
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* DNS Instructions - Always show helpful DNS guidance */}
                            <Alert ref={alertRef}>
                                <Info className="h-4 w-4" />
                                <AlertTitle>DNS & Subdomain Instructions</AlertTitle>
                                <AlertDescription className="mt-2 space-y-2">
                                    {!customDomain?.trim() ? (
                                        <>
                                            <p className="text-sm">By default each sub-account uses a subdomain on your main domain.</p>
                                            <div className="rounded-md bg-muted p-3 font-mono text-xs">
                                                <div className="grid gap-2">
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Subdomain example:</span>
                                                        <span className="font-semibold">{form.watch('slug') || 'client-slug'}.yourcrm.com</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">To enable automatic subdomains:</span>
                                                        <span className="font-semibold">CNAME *.yourcrm.com → yourcrm.com</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-xs text-muted-foreground">If you prefer the client to use their own domain, enter it in the Custom Domain field and we'll show the exact CNAME to add.</p>
                                        </>
                                    ) : (
                                        <>
                                            <p className="text-sm">The client needs to add this CNAME record in their DNS settings:</p>
                                            <div className="rounded-md bg-muted p-3 font-mono text-xs">
                                                <div className="grid grid-cols-[auto_auto_1fr] gap-2 items-center">
                                                    <span className="text-muted-foreground">Type:</span>
                                                    <span className="font-semibold">CNAME</span>
                                                    <span></span>
                                                    <span className="text-muted-foreground">Name:</span>
                                                    <span className="font-semibold break-all">{customDomain}</span>
                                                    <span></span>
                                                    <span className="text-muted-foreground">Points to:</span>
                                                    <span className="font-semibold">yourcrm.com</span>
                                                    <span className="text-muted-foreground text-[10px]">(your domain)</span>
                                                </div>
                                            </div>
                                            <p className="text-xs text-muted-foreground">💡 DNS propagation can take 5-60 minutes. The client will also need an SSL certificate for their custom domain.</p>
                                        </>
                                    )}
                                </AlertDescription>
                            </Alert>

                        </form>
                    </Form>
                </div>

                {/* Action Buttons - Outside scrollable area */}
                <DialogFooter className="mt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                            form.reset();
                            onOpenChange(false);
                        }}
                        disabled={createSubAccount.isPending}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={createSubAccount.isPending}
                        onClick={form.handleSubmit(onSubmit)}
                    >
                        {createSubAccount.isPending ? 'Creating...' : 'Create Sub-Account'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
