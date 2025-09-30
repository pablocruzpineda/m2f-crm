/**
 * @module pages/dashboard
 * @description Dashboard statistics cards
 */

import { Users, Workflow, TrendingUp, DollarSign } from 'lucide-react';

type ChangeType = 'positive' | 'negative' | 'neutral';

interface Stat {
  name: string;
  value: string;
  icon: typeof Users;
  change: string;
  changeType: ChangeType;
}

const stats: Stat[] = [
  {
    name: 'Total Contacts',
    value: '0',
    icon: Users,
    change: '+0%',
    changeType: 'neutral',
  },
  {
    name: 'Active Pipelines',
    value: '0',
    icon: Workflow,
    change: '+0%',
    changeType: 'neutral',
  },
  {
    name: 'Conversion Rate',
    value: '0%',
    icon: TrendingUp,
    change: '+0%',
    changeType: 'neutral',
  },
  {
    name: 'Revenue',
    value: '$0',
    icon: DollarSign,
    change: '+0%',
    changeType: 'neutral',
  },
];

export function StatsSection() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.name}
            className="rounded-lg border border bg-card p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="mt-2 text-3xl font-semibold text-foreground">
                  {stat.value}
                </p>
              </div>
              <div className="rounded-lg bg-primary/5 p-3">
                <Icon className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-4">
              <span
                className={`text-sm font-medium ${
                  stat.changeType === 'positive'
                    ? 'text-green-600'
                    : stat.changeType === 'negative'
                      ? 'text-red-600'
                      : 'text-gray-600'
                }`}
              >
                {stat.change}
              </span>
              <span className="text-sm text-gray-600"> from last month</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
