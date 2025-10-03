/**
 * @module pages/dashboard
 * @description Recent activity feed - Shows last 5 activities
 */

import { Link } from 'react-router-dom';
import { Activity, ArrowRight, Loader2 } from 'lucide-react';
import { useActivityLog } from '@/entities/activity-log';
import { ActivityItem } from '@/pages/activity/components/ActivityItem';

export function RecentActivity() {
  // Fetch only last 5 activities for dashboard
  const { data, isLoading } = useActivityLog({}, 5, 0);
  const activities = data?.data || [];

  return (
    <div className="rounded-lg border border bg-card">
      <div className="border-b border px-6 py-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
        <Link
          to="/activity"
          className="flex items-center gap-1 text-sm text-primary hover:underline"
        >
          View all
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : activities.length === 0 ? (
          <div className="p-12 text-center">
            <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No recent activity</p>
            <p className="text-sm text-muted-foreground mt-2">
              Activity from your team will appear here
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {activities.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
