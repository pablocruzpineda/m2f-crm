/**
 * @module widgets/app-sidebar/config
 * @description Navigation configuration
 */

import {
  LayoutDashboard,
  Users,
  Workflow,
  MessageSquare,
  Settings,
  UsersRound,
  Activity,
  Coins,
  Bot,
  Smartphone,
  Calendar,
  Building2,
} from 'lucide-react';
import type { NavigationGroup } from '@/shared/lib/navigation/types';

export const navigationGroups: NavigationGroup[] = [
  {
    items: [
      {
        label: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: 'Features',
    items: [
      {
        label: 'Contacts',
        href: '/contacts',
        icon: Users,
      },
      {
        label: 'Pipeline',
        href: '/pipeline',
        icon: Workflow,
      },
      {
        label: 'Calendar',
        href: '/calendar',
        icon: Calendar,
      },
      {
        label: 'Chat',
        href: '/chat',
        icon: MessageSquare,
      },
      {
        label: 'Activity',
        href: '/activity',
        icon: Activity,
      },
    ],
  },
  {
    title: 'Intelligence',
    items: [
      {
        label: 'Credits',
        href: '/intelligence/credits',
        icon: Coins,
      },
      {
        label: 'Agents',
        href: '/intelligence/agents',
        icon: Bot,
      },
      {
        label: 'Devices',
        href: '/intelligence/devices',
        icon: Smartphone,
      },
    ],
  },
  {
    title: 'Settings',
    items: [
      {
        label: 'Team',
        href: '/settings/team',
        icon: UsersRound,
      },
      {
        label: 'Sub-Accounts',
        href: '/settings/sub-accounts',
        icon: Building2,
      },
      {
        label: 'Appearance',
        href: '/settings',
        icon: Settings,
      },
    ],
  },
];
