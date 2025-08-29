
import { IndicatorCards } from '@/components/indicator-cards';
import { OptionChain } from '@/components/option-chain';
import { OrdersTable } from '@/components/orders-table';
import { PositionsTable } from '@/components/positions-table';
import { TradingTerminal } from '@/components/trading-terminal';

export default function DashboardPage() {
  return (
    <main className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2">
        {/* Top Row */}
        <div className="col-span-1">
            <TradingTerminal />
        </div>
        <div className="col-span-1">
            <IndicatorCards />
        </div>

        {/* Bottom Row */}
        <div className="col-span-1">
            <OptionChain />
        </div>
        <div className="col-span-1 grid grid-cols-1 gap-4 md:grid-cols-2">
            <PositionsTable />
            <OrdersTable />
        </div>
      </div>
    </main>
  );
}
