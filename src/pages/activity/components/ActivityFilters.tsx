/**
 * Activity Filters Component
 * Phase 5.3 - Step 8
 * 
 * Provides filtering controls for the activity feed.
 */

import { useState, useEffect } from 'react';
import { Search, X, User, FileText, Zap } from 'lucide-react';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Card, CardContent } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { useTeamMembers } from '@/entities/team';
import type { ActivityFilters as Filters } from '@/entities/activity-log';

interface ActivityFiltersProps {
    filters: Filters;
    onFiltersChange: (filters: Filters) => void;
}

// Predefined entity types
const entityTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'contact', label: 'Contacts' },
    { value: 'deal', label: 'Deals' },
    { value: 'message', label: 'Messages' },
    { value: 'workspace_member', label: 'Team Members' },
    { value: 'chat_settings', label: 'Chat Settings' },
];

// Predefined actions
const actions = [
    { value: 'all', label: 'All Actions' },
    { value: 'create', label: 'Created' },
    { value: 'update', label: 'Updated' },
    { value: 'delete', label: 'Deleted' },
    { value: 'add', label: 'Added' },
    { value: 'remove', label: 'Removed' },
    { value: 'change_role', label: 'Role Changed' },
    { value: 'status_change', label: 'Status Changed' },
];

export function ActivityFilters({ filters, onFiltersChange }: ActivityFiltersProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedUser, setSelectedUser] = useState(filters.user_id || 'all');
    const [selectedEntityType, setSelectedEntityType] = useState(filters.entity_type || 'all');
    const [selectedAction, setSelectedAction] = useState(filters.action || 'all');

    const { data: teamMembers } = useTeamMembers();

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            const newFilters: Filters = {};

            if (search) newFilters.search = search;
            if (selectedUser !== 'all') newFilters.user_id = selectedUser;
            if (selectedEntityType !== 'all') newFilters.entity_type = selectedEntityType;
            if (selectedAction !== 'all') newFilters.action = selectedAction;

            onFiltersChange(newFilters);
        }, 300);

        return () => clearTimeout(timer);
    }, [search, selectedUser, selectedEntityType, selectedAction, onFiltersChange]);

    const handleClearFilters = () => {
        setSearch('');
        setSelectedUser('all');
        setSelectedEntityType('all');
        setSelectedAction('all');
        onFiltersChange({});
    };

    const activeFilterCount = [
        search,
        selectedUser !== 'all',
        selectedEntityType !== 'all',
        selectedAction !== 'all',
    ].filter(Boolean).length;

    return (
        <Card>
            <CardContent className="pt-6">
                <div className="space-y-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search activities..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 pr-9"
                        />
                        {search && (
                            <button
                                onClick={() => setSearch('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    {/* Filter Selects */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* User Filter */}
                        <div>
                            <label className="text-sm font-medium mb-2 flex items-center gap-2">
                                <User className="h-4 w-4" />
                                User
                            </label>
                            <Select value={selectedUser} onValueChange={setSelectedUser}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select user" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Users</SelectItem>
                                    {teamMembers?.map((member) => (
                                        <SelectItem key={member.id} value={member.id}>
                                            {member.full_name || member.email}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Entity Type Filter */}
                        <div>
                            <label className="text-sm font-medium mb-2 flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Entity Type
                            </label>
                            <Select value={selectedEntityType} onValueChange={setSelectedEntityType}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {entityTypes.map((type) => (
                                        <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Action Filter */}
                        <div>
                            <label className="text-sm font-medium mb-2 flex items-center gap-2">
                                <Zap className="h-4 w-4" />
                                Action
                            </label>
                            <Select value={selectedAction} onValueChange={setSelectedAction}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select action" />
                                </SelectTrigger>
                                <SelectContent>
                                    {actions.map((action) => (
                                        <SelectItem key={action.value} value={action.value}>
                                            {action.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Active Filters & Clear */}
                    {activeFilterCount > 0 && (
                        <div className="flex items-center justify-between pt-2 border-t">
                            <div className="flex items-center gap-2">
                                <Badge variant="secondary">
                                    {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} active
                                </Badge>
                            </div>
                            <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                                <X className="mr-2 h-4 w-4" />
                                Clear Filters
                            </Button>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
