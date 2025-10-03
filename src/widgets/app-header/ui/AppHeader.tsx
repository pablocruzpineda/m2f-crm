/**
 * @module widgets/app-header
 * @description Application header with user menu and actions
 */

import { Menu, Bell } from 'lucide-react';
import { useCurrentUser } from '@/entities/user';
import { useSession } from '@/entities/session';
import { UserMenu } from '@/features/user-menu';
import { WorkspaceSwitcher } from '@/widgets/workspace-switcher';

interface AppHeaderProps {
  onMenuClick: () => void;
  isSidebarCollapsed: boolean;
}

export function AppHeader({ onMenuClick }: AppHeaderProps) {
  const { session } = useSession();
  const { data: user, isLoading } = useCurrentUser(session?.user?.id);

  return (
    <header className="flex h-16 items-center justify-between border-b border bg-card px-4 lg:px-6">
      {/* Left: Mobile Menu + Workspace Switcher */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onMenuClick}
          className="rounded-md p-2 text-gray-500 hover:bg-muted hover:text-gray-700 lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </button>

        <WorkspaceSwitcher />
      </div>

      {/* Right: Notifications + User Menu */}
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <button
          className="relative rounded-md p-2 text-gray-500 hover:bg-muted hover:text-gray-700"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
        </button>

        {/* User Menu */}
        {!isLoading && user && <UserMenu user={user} />}
      </div>
    </header>
  );
}
