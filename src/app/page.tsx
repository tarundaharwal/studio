
import { IndicatorCards } from '@/components/indicator-cards';
import { OptionChain } from '@/components/option-chain';
import { OrdersTable } from '@/components/orders-table';
import { PositionsTable } from '@/components/positions-table';
import { TradingTerminal } from '@/components/trading-terminal';

export default function DashboardPage() {
  return (
    <main className="flex-1 overflow-auto p-4 md:p-6">
      <div className="grid h-[calc(100vh-8rem)] grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
        {/* Left (smaller) */}
        <div className="col-span-1 flex flex-col gap-4 md:gap-6">
          <div className="flex-1">
            <TradingTerminal />
          </div>
          <div className="flex-1">
            <OptionChain />
          </div>
        </div>
        {/* Right (larger) */}
        <div className="col-span-2 flex flex-col gap-4 md:gap-6">
            <div className="flex-1">
                <IndicatorCards />
            </div>
            <div className="grid grid-cols-2 gap-4 md:gap-6 flex-1">
                <PositionsTable />
                <OrdersTable />
            </div>
        </div>
      </div>
    </main>
  );
}
