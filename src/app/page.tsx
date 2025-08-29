
import { IndicatorCards } from '@/components/indicator-cards';
import { OptionChain } from '@/components/option-chain';
import { OrdersTable } from '@/components/orders-table';
import { PositionsTable } from '@/components/positions-table';
import { TradingTerminal } from '@/components/trading-terminal';

export default function DashboardPage() {
  return (
    <main className="flex-1 overflow-auto p-4 md:p-6">
      <div className="grid h-[calc(100vh-8rem)] grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
        {/* Top-Left */}
        <div className="col-span-1 flex flex-col">
          <TradingTerminal />
        </div>
        {/* Top-Right */}
        <div className="col-span-1 flex flex-col">
          <IndicatorCards />
        </div>
        {/* Bottom-Left */}
        <div className="col-span-1 flex flex-col">
          <OptionChain />
        </div>
        {/* Bottom-Right */}
        <div className="col-span-1 grid grid-rows-2 gap-4 md:gap-6">
            <PositionsTable />
            <OrdersTable />
        </div>
      </div>
    </main>
  );
}
