/**
 * @module widgets/app-sidebar
 * @description Main application sidebar with navigation
 */

import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Building2 } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useCurrentWorkspace, useUserRole } from '@/entities/workspace';
import { navigationGroups } from '../config/navigation';

interface AppSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  onNavigate?: () => void;
}

// Extend Window interface to include our global variable
declare global {
  interface Window {
    __WORKSPACE_LOGO__?: string | null;
  }
}

export function AppSidebar({ isCollapsed, onToggle, onNavigate }: AppSidebarProps) {
  const location = useLocation();
  const { currentWorkspace } = useCurrentWorkspace();
  const { role } = useUserRole();

  // Initialize logo from global variable set by inline script (instant, no flash)
  const [logoUrl, setLogoUrl] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    // Use global variable set by inline script in index.html
    return window.__WORKSPACE_LOGO__ || null;
  });

  // Update logo when workspace changes
  useEffect(() => {
    if (currentWorkspace?.logo_url) {
      setLogoUrl(currentWorkspace.logo_url);
      // Also update global variable
      if (typeof window !== 'undefined') {
        window.__WORKSPACE_LOGO__ = currentWorkspace.logo_url;
      }
    } else if (currentWorkspace && !currentWorkspace.logo_url) {
      // If workspace loaded but has no logo, clear the stored logo
      setLogoUrl(null);
      if (typeof window !== 'undefined') {
        window.__WORKSPACE_LOGO__ = null;
      }
    }
  }, [currentWorkspace]);

  return (
    <div
      className={cn(
        'flex h-full flex-col border-r bg-background transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo and Collapse Button */}
      <div className="flex h-16 items-center justify-between border-b px-4">
        {!isCollapsed && (
          <Link to="/dashboard" className="flex items-center space-x-2">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={currentWorkspace?.name || 'Workspace'}
                className="h-8 w-auto max-w-[120px] object-contain"
              />
            ) : (
              <>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <Building2 className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-lg font-semibold text-foreground">
                  {currentWorkspace?.name || 'M2F CRM'}
                </span>
              </>
            )}
          </Link>
        )}
        {isCollapsed && (
          <Link
            to="/dashboard"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary"
          >
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={currentWorkspace?.name || 'Workspace'}
                className="h-8 w-8 object-contain"
              />
            ) : (
              <Building2 className="h-5 w-5 text-primary-foreground" />
            )}
          </Link>
        )}
        <button
          onClick={onToggle}
          className={cn(
            'hidden rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground lg:block',
            isCollapsed && 'mx-auto'
          )}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
        {navigationGroups.map((group, groupIndex) => (
          <div key={groupIndex}>
            {group.title && !isCollapsed && (
              <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {group.title}
              </h3>
            )}
            <ul className="space-y-1">
              {group.items.map((item) => {
                const isActive = location.pathname === item.href;
                const Icon = item.icon;

                return (
                  <li key={item.href}>
                    <Link
                      to={item.href}
                      onClick={onNavigate}
                      className={cn(
                        'group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-foreground hover:bg-muted hover:text-foreground'
                      )}
                      title={isCollapsed ? item.label : undefined}
                    >
                      <Icon
                        className={cn(
                          'h-5 w-5 flex-shrink-0',
                          isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                        )}
                      />
                      {!isCollapsed && (
                        <>
                          <span className="ml-3">{item.label}</span>
                          {item.badge && (
                            <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer - Workspace Info */}
      {!isCollapsed && (
        <div className="border-t p-4">
          <p className="text-xs font-medium text-foreground">
            {currentWorkspace?.name || 'Workspace'}
          </p>
          <p className="text-xs text-muted-foreground mt-1 capitalize">
            {role || 'Member'}
          </p>
        </div>
      )}
    </div>
  );
}
