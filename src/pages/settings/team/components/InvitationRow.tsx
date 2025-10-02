/**
 * Invitation Row Component
 * Displays a single invitation with actions (resend, cancel)
 */

import { useState } from 'react'
import { Button } from '@/shared/ui/button'
import { Badge } from '@/shared/ui/badge'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { ConfirmDialog } from '@/shared/ui/confirm-dialog'
import { Loader2, Mail, Phone, MoreVertical, Send, XCircle, Clock } from 'lucide-react'
import { useResendInvitation, useCancelInvitation, useTimeUntilExpiry, useIsInvitationExpired } from '@/entities/team'
import type { TeamInvitation } from '@/shared/lib/database/types'
import { toast } from 'sonner'

interface InvitationRowProps {
    invitation: TeamInvitation
}

export function InvitationRow({ invitation }: InvitationRowProps) {
    const [showCancelDialog, setShowCancelDialog] = useState(false)

    const resendInvitation = useResendInvitation()
    const cancelInvitation = useCancelInvitation()
    const timeLeft = useTimeUntilExpiry(invitation)
    const isExpired = useIsInvitationExpired(invitation)

    const handleResend = () => {
        resendInvitation.mutate(invitation.id, {
            onSuccess: () => {
                toast.success('Invitation resent via WhatsApp! 📱')
            },
            onError: (error) => {
                toast.error(error.message || 'Failed to resend invitation')
            },
        })
    }

    const handleCancel = () => {
        cancelInvitation.mutate(invitation.id, {
            onSuccess: () => {
                toast.success('Invitation cancelled')
                setShowCancelDialog(false)
            },
            onError: (error) => {
                toast.error(error.message || 'Failed to cancel invitation')
            },
        })
    }

    // Status badge styling
    const getStatusBadge = () => {
        switch (invitation.status) {
            case 'pending':
                return (
                    <Badge variant="default" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                    </Badge>
                )
            case 'accepted':
                return (
                    <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Accepted
                    </Badge>
                )
            case 'expired':
                return (
                    <Badge variant="destructive">
                        Expired
                    </Badge>
                )
            case 'cancelled':
                return (
                    <Badge variant="secondary" className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                        Cancelled
                    </Badge>
                )
            default:
                return <Badge>{invitation.status}</Badge>
        }
    }

    // Role badge styling
    const getRoleBadge = () => {
        const roleColors = {
            admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
            member: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
            viewer: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
        }

        return (
            <Badge variant="outline" className={roleColors[invitation.role as keyof typeof roleColors] || ''}>
                {invitation.role}
            </Badge>
        )
    }

    const isLoading = resendInvitation.isPending || cancelInvitation.isPending
    const canResend = invitation.status === 'pending'
    const canCancel = invitation.status === 'pending'

    return (
        <>
            <div className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                {/* Left: User Info */}
                <div className="flex items-start gap-4 flex-1 min-w-0">
                    {/* Avatar placeholder */}
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
                        {invitation.full_name.charAt(0).toUpperCase()}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium text-foreground truncate">
                                {invitation.full_name}
                            </p>
                            {getRoleBadge()}
                            {getStatusBadge()}
                        </div>

                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground flex-wrap">
                            <span className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {invitation.email}
                            </span>
                            <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {invitation.phone}
                            </span>
                        </div>

                        {/* Expiry info */}
                        {invitation.status === 'pending' && (
                            <div className="mt-1">
                                <span className={`text-xs ${isExpired ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                                    {isExpired ? '⚠️ Expired' : `⏱️ Expires in ${timeLeft}`}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                    {canResend && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleResend}
                            disabled={isLoading}
                        >
                            {resendInvitation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <>
                                    <Send className="h-4 w-4 mr-2" />
                                    Resend
                                </>
                            )}
                        </Button>
                    )}

                    {/* More actions menu */}
                    {(canResend || canCancel) && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    disabled={isLoading}
                                >
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {canResend && (
                                    <DropdownMenuItem onClick={handleResend} disabled={isLoading}>
                                        <Send className="h-4 w-4 mr-2" />
                                        Resend Invitation
                                    </DropdownMenuItem>
                                )}
                                {canCancel && (
                                    <DropdownMenuItem
                                        onClick={() => setShowCancelDialog(true)}
                                        disabled={isLoading}
                                        className="text-destructive focus:text-destructive"
                                    >
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Cancel Invitation
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </div>

            {/* Cancel Confirmation Dialog */}
            <ConfirmDialog
                open={showCancelDialog}
                onOpenChange={setShowCancelDialog}
                title="Cancel Invitation"
                description={`Are you sure you want to cancel the invitation for ${invitation.full_name}? They will not be able to accept the invitation anymore.`}
                confirmLabel="Cancel Invitation"
                onConfirm={handleCancel}
                variant="destructive"
                isLoading={cancelInvitation.isPending}
            />
        </>
    )
}
