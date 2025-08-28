import { OverviewCards } from '@/components/overview-cards';
import { PerformanceChart } from '@/components/performance-chart';
import { PositionsTable } from '@/components/positions-table';
import { OrdersTable } from '@/components/orders-table';
import { SignalsFeed } from '@/components/signals-feed';

export default function DashboardPage() {
  return (
    <main className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <OverviewCards />
      </div>
      <div className="grid grid-cols-1 gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <PerformanceChart />
        </div>
        <SignalsFeed />
      </div>
      <div className="grid grid-cols-1 gap-4 md:gap-8">
        <PositionsTable />
      </div>
      <div className="grid grid-cols-1 gap-4 md:gap-8">
        <OrdersTable />
      </div>
    </main>
  );
}
