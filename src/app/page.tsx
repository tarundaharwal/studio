
import { IndicatorGauge } from '@/components/indicator-gauge';
import { OptionChain } from '@/components/option-chain';
import { OrdersTable } from '@/components/orders-table';
import { OverviewCards } from '@/components/overview-cards';
import { PerformanceChart } from '@/components/performance-chart';
import { PositionsTable } from '@/components/positions-table';
import { SignalsFeed } from '@/components/signals-feed';
import { TradingTerminal } from '@/components/trading-terminal';

export default function DashboardPage() {
  return (
    <main className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Main Column */}
        <div className="col-span-1 flex flex-col gap-6 lg:col-span-2">
            <TradingTerminal />
            <PositionsTable />
            <OrdersTable />
        </div>

        {/* Right Column 1 */}
        <div className="col-span-1 flex flex-col gap-6">
          <OverviewCards />
          <OptionChain />
        </div>

        {/* Right Column 2 */}
        <div className="col-span-1 flex flex-col gap-6">
          <PerformanceChart />
          <IndicatorGauge />
          <SignalsFeed />
        </div>
      </div>
    </main>
  );
}
