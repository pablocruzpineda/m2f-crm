/**
 * @module pages/dashboard
 * @description Welcome section with user greeting
 */

import { useCurrentUser } from '@/entities/user';
import { useSession } from '@/entities/session';

export function WelcomeSection() {
  const { session } = useSession();
  const { data: user, isLoading } = useCurrentUser(session?.user?.id);

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 w-64 bg-gray-200 rounded"></div>
        <div className="mt-2 h-4 w-96 bg-gray-200 rounded"></div>
      </div>
    );
  }

  const greeting = getGreeting();
  const name = user?.full_name || 'there';

  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground">
        {greeting}, {name}!
      </h1>
      <p className="mt-2 text-gray-600">
        Here's what's happening with your business today.
      </p>
    </div>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}
