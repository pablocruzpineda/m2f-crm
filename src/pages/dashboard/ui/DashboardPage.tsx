/**
 * @module pages/dashboard
 * @description Main dashboard page
 */

import { PageContainer } from '@/shared/ui/layouts/PageContainer';
import { WelcomeSection } from './WelcomeSection';
import { StatsSection } from './StatsSection';
import { RecentActivity } from './RecentActivity';

export function DashboardPage() {
  return (
    <PageContainer>
      <div className="space-y-8">
        <WelcomeSection />
        <StatsSection />
        <RecentActivity />
      </div>
    </PageContainer>
  );
}
