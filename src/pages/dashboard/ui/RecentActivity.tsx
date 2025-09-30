/**
 * @module pages/dashboard
 * @description Recent activity feed
 */

import { EmptyState } from '@/shared/ui/empty-state/EmptyState';
import { Activity } from 'lucide-react';

export function RecentActivity() {
  // Placeholder - will be populated with real data later
  const activities: Array<{ id: string }> = [];

  return (
    <div className="rounded-lg border border bg-card">
      <div className="border-b border px-6 py-4">
        <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
      </div>
      <div className="p-6">
        {activities.length === 0 ? (
          <EmptyState
            icon={Activity}
            title="No recent activity"
            description="Activity from your contacts and pipelines will appear here."
          />
        ) : (
          <ul className="space-y-4">
            {activities.map((activity) => (
              <li key={activity.id} className="flex items-start space-x-3">
                {/* Activity items will go here */}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
