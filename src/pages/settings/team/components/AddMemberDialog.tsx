/**
 * Add Member Dialog
 * Allows owners/admins to add existing members or invite new ones via WhatsApp
 */

import { useState } from 'react'
import { Button } from '@/shared/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/shared/ui/dialog'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/ui/select'
import { Alert, AlertDescription } from '@/shared/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { Loader2, Info, AlertTriangle, Send, UserPlus } from 'lucide-react'
import { useAddTeamMember, useSendInvitation, useHasPendingInvitation } from '@/entities/team'
import { useWorkspaceChatSettings } from '@/entities/chat-settings'
import type { Role } from '@/shared/lib/permissions'
import { toast } from 'sonner'

interface AddMemberDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

// Country codes for phone number selection
const COUNTRY_CODES = [
    { code: '+1', country: 'US/Canada', flag: '🇺🇸' },
    { code: '+52', country: 'Mexico', flag: '🇲🇽' },
    { code: '+34', country: 'Spain', flag: '🇪🇸' },
    { code: '+44', country: 'UK', flag: '🇬🇧' },
    { code: '+49', country: 'Germany', flag: '🇩🇪' },
    { code: '+33', country: 'France', flag: '🇫🇷' },
    { code: '+39', country: 'Italy', flag: '🇮🇹' },
    { code: '+55', country: 'Brazil', flag: '🇧🇷' },
    { code: '+54', country: 'Argentina', flag: '🇦🇷' },
    { code: '+57', country: 'Colombia', flag: '🇨🇴' },
]

export function AddMemberDialog({ open, onOpenChange }: AddMemberDialogProps) {
    // Tab state
    const [activeTab, setActiveTab] = useState<'invite' | 'existing'>('invite')

    // Existing member form state
    const [existingEmail, setExistingEmail] = useState('')
    const [existingRole, setExistingRole] = useState<Role>('member')

    // Invitation form state
    const [inviteFullName, setInviteFullName] = useState('')
    const [inviteEmail, setInviteEmail] = useState('')
    const [inviteCountryCode, setInviteCountryCode] = useState('+1')
    const [invitePhone, setInvitePhone] = useState('')
    const [inviteRole, setInviteRole] = useState<Role>('member')

    // Hooks
    const addMember = useAddTeamMember()
    const sendInvitation = useSendInvitation()
    const hasPendingInvitation = useHasPendingInvitation(inviteEmail)
    const { data: chatSettings } = useWorkspaceChatSettings()

    const whatsappConfigured = chatSettings?.is_active && chatSettings?.api_key

    const handleExistingMemberSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!existingEmail.trim()) return

        await addMember.mutateAsync(
            { email: existingEmail.trim(), role: existingRole },
            {
                onSuccess: () => {
                    toast.success('Team member added successfully!')
                    resetExistingForm()
                    onOpenChange(false)
                },
                onError: (error) => {
                    toast.error(error.message || 'Failed to add team member')
                },
            }
        )
    }

    const handleInvitationSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!inviteFullName.trim() || !inviteEmail.trim() || !invitePhone.trim()) {
            toast.error('Please fill in all required fields')
            return
        }

        if (!whatsappConfigured) {
            toast.error('WhatsApp is not configured. Please configure it in Chat Settings.')
            return
        }

        if (hasPendingInvitation) {
            toast.error('This email already has a pending invitation')
            return
        }

        await sendInvitation.mutateAsync(
            {
                email: inviteEmail.trim(),
                full_name: inviteFullName.trim(),
                phone: invitePhone.trim(),
                country_code: inviteCountryCode,
                role: inviteRole,
            },
            {
                onSuccess: () => {
                    toast.success('Invitation sent via WhatsApp! 📱')
                    resetInviteForm()
                    onOpenChange(false)
                },
                onError: (error) => {
                    toast.error(error.message || 'Failed to send invitation')
                },
            }
        )
    }

    const resetExistingForm = () => {
        setExistingEmail('')
        setExistingRole('member')
    }

    const resetInviteForm = () => {
        setInviteFullName('')
        setInviteEmail('')
        setInvitePhone('')
        setInviteCountryCode('+1')
        setInviteRole('member')
    }

    const handleOpenChange = (newOpen: boolean) => {
        if (!addMember.isPending && !sendInvitation.isPending) {
            resetExistingForm()
            resetInviteForm()
            onOpenChange(newOpen)
        }
    }

    const isLoading = addMember.isPending || sendInvitation.isPending

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Add Team Member</DialogTitle>
                    <DialogDescription>
                        Invite a new member via WhatsApp or add an existing user to your workspace.
                    </DialogDescription>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'invite' | 'existing')} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="invite" className="flex items-center gap-2">
                            <Send className="h-4 w-4" />
                            Invite New Member
                        </TabsTrigger>
                        <TabsTrigger value="existing" className="flex items-center gap-2">
                            <UserPlus className="h-4 w-4" />
                            Add Existing User
                        </TabsTrigger>
                    </TabsList>

                    {/* Invite New Member Tab */}
                    <TabsContent value="invite">
                        {!whatsappConfigured && (
                            <Alert variant="destructive" className="mb-4">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription>
                                    WhatsApp integration is not configured. Please configure it in Chat Settings to send invitations.
                                </AlertDescription>
                            </Alert>
                        )}

                        <form onSubmit={handleInvitationSubmit} className="space-y-4">
                            {/* Full Name */}
                            <div className="space-y-2">
                                <Label htmlFor="invite-name">Full Name *</Label>
                                <Input
                                    id="invite-name"
                                    type="text"
                                    placeholder="John Doe"
                                    value={inviteFullName}
                                    onChange={(e) => setInviteFullName(e.target.value)}
                                    disabled={isLoading}
                                    required
                                />
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <Label htmlFor="invite-email">Email Address *</Label>
                                <Input
                                    id="invite-email"
                                    type="email"
                                    placeholder="john@example.com"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    disabled={isLoading}
                                    required
                                />
                                {hasPendingInvitation && (
                                    <p className="text-xs text-orange-600 dark:text-orange-400">
                                        ⚠️ This email already has a pending invitation
                                    </p>
                                )}
                            </div>

                            {/* Phone Number */}
                            <div className="space-y-2">
                                <Label htmlFor="invite-phone">Phone Number (WhatsApp) *</Label>
                                <div className="flex gap-2">
                                    <Select
                                        value={inviteCountryCode}
                                        onValueChange={setInviteCountryCode}
                                        disabled={isLoading}
                                    >
                                        <SelectTrigger className="w-[140px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {COUNTRY_CODES.map((cc) => (
                                                <SelectItem key={cc.code} value={cc.code}>
                                                    <span className="flex items-center gap-2">
                                                        <span>{cc.flag}</span>
                                                        <span>{cc.code}</span>
                                                    </span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Input
                                        id="invite-phone"
                                        type="tel"
                                        placeholder="1234567890"
                                        value={invitePhone}
                                        onChange={(e) => setInvitePhone(e.target.value.replace(/\D/g, ''))}
                                        disabled={isLoading}
                                        required
                                        className="flex-1"
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    📱 Invitation will be sent via WhatsApp
                                </p>
                            </div>

                            {/* Role */}
                            <div className="space-y-2">
                                <Label htmlFor="invite-role">Role</Label>
                                <Select
                                    value={inviteRole}
                                    onValueChange={(value: string) => setInviteRole(value as Role)}
                                    disabled={isLoading}
                                >
                                    <SelectTrigger id="invite-role">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="admin">
                                            <div className="flex flex-col items-start">
                                                <span className="font-medium">Admin</span>
                                                <span className="text-xs text-muted-foreground">
                                                    Full team management and data access
                                                </span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="member">
                                            <div className="flex flex-col items-start">
                                                <span className="font-medium">Member</span>
                                                <span className="text-xs text-muted-foreground">
                                                    Access to assigned contacts and deals
                                                </span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="viewer">
                                            <div className="flex flex-col items-start">
                                                <span className="font-medium">Viewer</span>
                                                <span className="text-xs text-muted-foreground">
                                                    Read-only access to assigned data
                                                </span>
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Info Alert */}
                            <Alert>
                                <Info className="h-4 w-4" />
                                <AlertDescription>
                                    The user will receive a WhatsApp message with a magic link to create their account.
                                    The invitation expires in 7 days.
                                </AlertDescription>
                            </Alert>

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => handleOpenChange(false)}
                                    disabled={isLoading}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isLoading || !whatsappConfigured || hasPendingInvitation || !inviteFullName.trim() || !inviteEmail.trim() || !invitePhone.trim()}
                                >
                                    {sendInvitation.isPending && (
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    )}
                                    <Send className="h-4 w-4 mr-2" />
                                    Send Invitation
                                </Button>
                            </DialogFooter>
                        </form>
                    </TabsContent>

                    {/* Add Existing User Tab */}
                    <TabsContent value="existing">
                        <form onSubmit={handleExistingMemberSubmit} className="space-y-4">
                            {/* Email Input */}
                            <div className="space-y-2">
                                <Label htmlFor="existing-email">Email Address</Label>
                                <Input
                                    id="existing-email"
                                    type="email"
                                    placeholder="colleague@example.com"
                                    value={existingEmail}
                                    onChange={(e) => setExistingEmail(e.target.value)}
                                    disabled={isLoading}
                                    required
                                />
                                <p className="text-xs text-muted-foreground">
                                    The user must already be registered in the system
                                </p>
                            </div>

                            {/* Role Selection */}
                            <div className="space-y-2">
                                <Label htmlFor="existing-role">Role</Label>
                                <Select
                                    value={existingRole}
                                    onValueChange={(value: string) => setExistingRole(value as Role)}
                                    disabled={isLoading}
                                >
                                    <SelectTrigger id="existing-role">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="admin">
                                            <div className="flex flex-col items-start">
                                                <span className="font-medium">Admin</span>
                                                <span className="text-xs text-muted-foreground">
                                                    Full team management and data access
                                                </span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="member">
                                            <div className="flex flex-col items-start">
                                                <span className="font-medium">Member</span>
                                                <span className="text-xs text-muted-foreground">
                                                    Access to assigned contacts and deals
                                                </span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="viewer">
                                            <div className="flex flex-col items-start">
                                                <span className="font-medium">Viewer</span>
                                                <span className="text-xs text-muted-foreground">
                                                    Read-only access to assigned data
                                                </span>
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Info Alert */}
                            <Alert>
                                <Info className="h-4 w-4" />
                                <AlertDescription>
                                    The user will receive access immediately and can log in to view their assigned data.
                                </AlertDescription>
                            </Alert>

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => handleOpenChange(false)}
                                    disabled={isLoading}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isLoading || !existingEmail.trim()}>
                                    {addMember.isPending && (
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    )}
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Add Member
                                </Button>
                            </DialogFooter>
                        </form>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}
