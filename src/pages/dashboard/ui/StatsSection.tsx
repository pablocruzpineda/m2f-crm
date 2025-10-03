/**
 * @module pages/dashboard
 * @description Dashboard statistics cards
 */

import { Users, Workflow, MessageSquare, UsersRound } from 'lucide-react';
import { useDashboardStats } from '@/entities/dashboard';
import { useCurrentWorkspace } from '@/entities/workspace';
import { Skeleton } from '@/shared/ui/skeleton/LoadingSkeleton';

export function StatsSection() {
  const { currentWorkspace } = useCurrentWorkspace();
  const { data: stats, isLoading } = useDashboardStats(currentWorkspace?.id);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  const statCards = [
    {
      name: 'Total Contacts',
      value: stats?.totalContacts || 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      name: 'Active Deals',
      value: stats?.totalDeals || 0,
      icon: Workflow,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      name: 'Messages',
      value: stats?.totalMessages || 0,
      icon: MessageSquare,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      name: 'Team Members',
      value: stats?.activeTeamMembers || 0,
      icon: UsersRound,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.name}
            className="rounded-lg border border bg-card p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
                <p className="mt-2 text-3xl font-semibold text-foreground">
                  {stat.value.toLocaleString()}
                </p>
              </div>
              <div className={`rounded-lg ${stat.bgColor} p-3`}>
                <Icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
