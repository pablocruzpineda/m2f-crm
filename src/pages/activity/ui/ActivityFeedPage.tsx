/**
 * Activity Feed Page
 * Phase 5.3 - Step 8
 * 
 * Shows a real-time feed of all workspace activities with filtering capabilities.
 */

import { useState } from 'react';
import { Loader2, Activity as ActivityIcon } from 'lucide-react';
import { PageContainer } from '@/shared/ui/layouts/PageContainer';
import { Card, CardContent } from '@/shared/ui/card';
import { useActivityLog, useActivitySubscription, type ActivityFilters } from '@/entities/activity-log';
import { ActivityItem } from '../components/ActivityItem';
import { ActivityFilters as ActivityFiltersComponent } from '../components/ActivityFilters';

export function ActivityFeedPage() {
    const [filters, setFilters] = useState<ActivityFilters>({});
    const [page, setPage] = useState(0);
    const limit = 50;
    const offset = page * limit;

    // Fetch activity log
    const { data, isLoading, error } = useActivityLog(filters, limit, offset);

    // Subscribe to real-time updates
    useActivitySubscription();

    const activities = data?.data || [];
    const totalCount = data?.count || 0;
    const hasMore = offset + limit < totalCount;
    const hasPrevious = page > 0;

    const handleFiltersChange = (newFilters: ActivityFilters) => {
        setFilters(newFilters);
        setPage(0); // Reset to first page when filters change
    };

    const handleNextPage = () => {
        if (hasMore) {
            setPage((p) => p + 1);
        }
    };

    const handlePreviousPage = () => {
        if (hasPrevious) {
            setPage((p) => p - 1);
        }
    };

    return (
        <PageContainer>
            <div className="flex items-center gap-3 mb-6">
                <ActivityIcon className="h-8 w-8 text-primary" />
                <div>
                    <h1 className="text-3xl font-bold">Activity Feed</h1>
                    <p className="text-muted-foreground">Real-time view of all workspace activities</p>
                </div>
            </div>

            <div className="space-y-6">
                {/* Filters */}
                <ActivityFiltersComponent
                    filters={filters}
                    onFiltersChange={handleFiltersChange}
                />

                {/* Activity List */}
                <Card>
                    <CardContent className="p-0">
                        {isLoading && (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        )}

                        {error && (
                            <div className="p-6 text-center">
                                <p className="text-destructive">Failed to load activity feed</p>
                                <p className="text-sm text-muted-foreground mt-2">
                                    {error instanceof Error ? error.message : 'Unknown error'}
                                </p>
                            </div>
                        )}

                        {!isLoading && !error && activities.length === 0 && (
                            <div className="p-12 text-center">
                                <ActivityIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                <p className="text-lg font-medium">No activities found</p>
                                <p className="text-sm text-muted-foreground mt-2">
                                    {Object.keys(filters).length > 0
                                        ? 'Try adjusting your filters'
                                        : 'Activities will appear here as team members work'}
                                </p>
                            </div>
                        )}

                        {!isLoading && !error && activities.length > 0 && (
                            <div className="divide-y divide-border">
                                {activities.map((activity) => (
                                    <ActivityItem key={activity.id} activity={activity} />
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {!isLoading && !error && totalCount > limit && (
                            <div className="flex items-center justify-between px-6 py-4 border-t">
                                <p className="text-sm text-muted-foreground">
                                    Showing {offset + 1}-{Math.min(offset + limit, totalCount)} of {totalCount} activities
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handlePreviousPage}
                                        disabled={!hasPrevious}
                                        className="px-4 py-2 text-sm font-medium rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={handleNextPage}
                                        disabled={!hasMore}
                                        className="px-4 py-2 text-sm font-medium rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </PageContainer>
    );
}
