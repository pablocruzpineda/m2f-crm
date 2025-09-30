/**
 * @module features/user-menu
 * @description User dropdown menu with profile and logout
 */

import { LogOut, Settings, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLogout } from '@/features/auth/logout';
import type { UserProfile } from '@/shared/lib/auth/types';

interface UserMenuProps {
  user: UserProfile;
}

export function UserMenu({ user }: UserMenuProps) {
  const { logout, isLoading } = useLogout();

  const initials = user.full_name
    ? user.full_name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : user.email.slice(0, 2).toUpperCase();

  return (
    <div className="relative group">
      {/* Avatar Button */}
      <button
        className="flex items-center space-x-3 rounded-lg p-2 hover:bg-muted"
        aria-label="User menu"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-white">
          {initials}
        </div>
        <div className="hidden text-left md:block">
          <p className="text-sm font-medium text-foreground">
            {user.full_name || user.email}
          </p>
          <p className="text-xs text-gray-500">View profile</p>
        </div>
      </button>

      {/* Dropdown Menu */}
      <div className="absolute right-0 top-full mt-2 hidden w-56 rounded-lg border border bg-card shadow-lg group-hover:block">
        {/* User Info */}
        <div className="border-b border px-4 py-3">
          <p className="text-sm font-medium text-foreground">
            {user.full_name || 'User'}
          </p>
          <p className="text-xs text-gray-500 truncate">{user.email}</p>
        </div>

        {/* Menu Items */}
        <div className="py-1">
          <Link
            to="/profile"
            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-muted"
          >
            <User className="mr-3 h-4 w-4" />
            Your Profile
          </Link>
          <Link
            to="/settings"
            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-muted"
          >
            <Settings className="mr-3 h-4 w-4" />
            Settings
          </Link>
        </div>

        {/* Logout */}
        <div className="border-t border py-1">
          <button
            onClick={() => logout()}
            disabled={isLoading}
            className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            <LogOut className="mr-3 h-4 w-4" />
            {isLoading ? 'Signing out...' : 'Sign out'}
          </button>
        </div>
      </div>
    </div>
  );
}
