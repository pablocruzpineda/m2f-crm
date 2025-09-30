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
        label: 'Chat',
        href: '/chat',
        icon: MessageSquare,
      },
    ],
  },
  {
    title: 'Settings',
    items: [
      {
        label: 'Settings',
        href: '/settings',
        icon: Settings,
      },
    ],
  },
];
