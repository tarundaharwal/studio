import { IndicatorCards } from '@/components/indicator-cards';
import { OptionChain } from '@/components/option-chain';
import { OrdersTable } from '@/components/orders-table';
import { PositionsTable } from '@/components/positions-table';
import { TradingTerminal } from '@/components/trading-terminal';

export default function DashboardPage() {
  return (
    <main className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-8 xl:grid-cols-5">
        <div className="xl:col-span-3">
          <TradingTerminal />
        </div>
        <div className="grid gap-4 md:gap-8 xl:col-span-2">
            <IndicatorCards />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-8 xl:grid-cols-5">
        <div className="xl:col-span-3">
            <OptionChain />
        </div>
        <div className="space-y-4 md:space-y-8 xl:col-span-2">
            <PositionsTable />
            <OrdersTable />
        </div>
      </div>
    </main>
  );
}
