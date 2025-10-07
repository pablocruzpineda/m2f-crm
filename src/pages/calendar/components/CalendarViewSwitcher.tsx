/**
 * @module pages/calendar/components
 * @description Calendar view switcher (month/week/day)
 */

import type { View } from 'react-big-calendar';
import { Calendar, CalendarDays, CalendarRange } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/lib/utils';

interface CalendarViewSwitcherProps {
    view: View;
    onViewChange: (view: View) => void;
}

export function CalendarViewSwitcher({ view, onViewChange }: CalendarViewSwitcherProps) {
    const views: { value: View; label: string; icon: React.ReactNode }[] = [
        { value: 'month', label: 'Month', icon: <Calendar className="h-4 w-4" /> },
        { value: 'week', label: 'Week', icon: <CalendarRange className="h-4 w-4" /> },
        { value: 'day', label: 'Day', icon: <CalendarDays className="h-4 w-4" /> },
    ];

    return (
        <div className="flex items-center space-x-1 bg-muted/50 p-1 rounded-lg">
            {views.map((viewOption) => (
                <Button
                    key={viewOption.value}
                    variant={view === viewOption.value ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => onViewChange(viewOption.value)}
                    className={cn(
                        'transition-all',
                        view === viewOption.value && 'shadow-sm'
                    )}
                >
                    {viewOption.icon}
                    <span className="ml-2">{viewOption.label}</span>
                </Button>
            ))}
        </div>
    );
}
