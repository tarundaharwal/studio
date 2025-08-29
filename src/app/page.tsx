
import { IndicatorCards } from '@/components/indicator-cards';
import { OptionChain } from '@/components/option-chain';
import { OrdersTable } from '@/components/orders-table';
import { PositionsTable } from '@/components/positions-table';
import { TradingTerminal } from '@/components/trading-terminal';

export default function DashboardPage() {
  return (
    <main className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="grid h-[calc(100vh-8rem)] grid-cols-1 gap-4 md:grid-cols-2">
        {/* Column 1 */}
        <div className="flex flex-col gap-4">
          <div className="flex-grow-0 flex-shrink-0 basis-1/2">
            <TradingTerminal />
          </div>
          <div className="flex-1">
            <OptionChain />
          </div>
        </div>

        {/* Column 2 */}
        <div className="flex flex-col gap-4">
          <div className="flex-grow-0 flex-shrink-0 basis-1/2">
            <IndicatorCards />
          </div>
          <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-2">
            <PositionsTable />
            <OrdersTable />
          </div>
        </div>
      </div>
    </main>
  );
}
