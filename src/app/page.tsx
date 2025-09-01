
'use client'

import { IndicatorGauge } from '@/components/indicator-gauge';
import { OptionChain } from '@/components/option-chain';
import { OrdersTable } from '@/components/orders-table';
import { OverviewCards } from '@/components/overview-cards';
import { PerformanceChart } from '@/components/performance-chart';
import { PositionsTable } from '@/components/positions-table';
import { SignalsFeed } from '@/components/signals-feed';
import { TradingTerminal } from '@/components/trading-terminal';
import { DataSimulator } from '@/components/data-simulator';

export default function DashboardPage() {
  return (
    <>
      <DataSimulator />
      <main className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Main Column */}
          <div className="col-span-1 flex flex-col gap-6 lg:col-span-2">
              <div className="h-[420px]">
                <TradingTerminal />
              </div>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <PositionsTable />
                <OrdersTable />
              </div>
          </div>

          {/* Middle Column */}
          <div className="col-span-1 flex flex-col gap-6">
            <div className="h-[420px]">
              <OptionChain />
            </div>
            <IndicatorGauge />
            <SignalsFeed />
          </div>

          {/* Right Column */}
          <div className="col-span-1 flex flex-col gap-6">
            <OverviewCards />
            <PerformanceChart />
          </div>
        </div>
      </main>
    </>
  );
}
