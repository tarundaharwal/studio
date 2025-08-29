
import { IndicatorCards } from '@/components/indicator-cards';
import { OptionChain } from '@/components/option-chain';
import { OrdersTable } from '@/components/orders-table';
import { PositionsTable } from '@/components/positions-table';
import { TradingTerminal } from '@/components/trading-terminal';

export default function DashboardPage() {
  return (
    <main className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2">
        {/* Column 1 */}
        <div className="flex flex-col gap-4">
          <div className="flex-[0.5]">
            <TradingTerminal />
          </div>
          <div className="flex-1">
            <OptionChain />
          </div>
        </div>

        {/* Column 2 */}
        <div className="flex flex-col gap-4">
          <div>
            <IndicatorCards />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <PositionsTable />
            <OrdersTable />
          </div>
        </div>
      </div>
    </main>
  );
}
