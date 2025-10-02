/**
 * Assignment Filter Tabs
 * Phase 5.3 - Team Collaboration
 * Allows filtering contacts/deals by assignment (My vs All)
 */

import { useUserRole } from '@/entities/workspace';
import { User, Users } from 'lucide-react';

interface AssignmentFilterTabsProps {
    activeTab: 'my' | 'all';
    onTabChange: (tab: 'my' | 'all') => void;
    myCount?: number;
    allCount?: number;
}

export function AssignmentFilterTabs({
    activeTab,
    onTabChange,
    myCount,
    allCount,
}: AssignmentFilterTabsProps) {
    const { canSeeAllData } = useUserRole();

    // If user cannot see all data, don't show tabs
    if (!canSeeAllData) {
        return null;
    }

    return (
        <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                <button
                    onClick={() => onTabChange('my')}
                    className={`
            group inline-flex items-center gap-2 border-b-2 py-4 px-1 text-sm font-medium
            ${activeTab === 'my'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                        }
          `}
                >
                    <User className="h-5 w-5" />
                    My Items
                    {myCount !== undefined && (
                        <span
                            className={`
                ml-2 rounded-full px-2.5 py-0.5 text-xs font-medium
                ${activeTab === 'my'
                                    ? 'bg-primary/10 text-primary'
                                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                }
              `}
                        >
                            {myCount}
                        </span>
                    )}
                </button>

                <button
                    onClick={() => onTabChange('all')}
                    className={`
            group inline-flex items-center gap-2 border-b-2 py-4 px-1 text-sm font-medium
            ${activeTab === 'all'
                            ? 'border-primary text-primary'
                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                        }
          `}
                >
                    <Users className="h-5 w-5" />
                    All Items
                    {allCount !== undefined && (
                        <span
                            className={`
                ml-2 rounded-full px-2.5 py-0.5 text-xs font-medium
                ${activeTab === 'all'
                                    ? 'bg-primary/10 text-primary'
                                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                }
              `}
                        >
                            {allCount}
                        </span>
                    )}
                </button>
            </nav>
        </div>
    );
}
