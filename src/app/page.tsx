
import { IndicatorCards } from '@/components/indicator-cards';
import { OptionChain } from '@/components/option-chain';
import { OrdersTable } from '@/components/orders-table';
import { PositionsTable } from '@/components/positions-table';
import { TradingTerminal } from '@/components/trading-terminal';

export default function DashboardPage() {
  return (
    <main className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="grid h-[calc(100vh-8rem)] grid-cols-1 grid-rows-3 gap-4 md:grid-cols-5 md:grid-rows-2">
        <div className="md:col-span-3 md:row-span-2">
          <TradingTerminal />
        </div>
        <div className="grid grid-cols-2 gap-4 md:col-span-2 md:row-span-1 md:grid-cols-4">
            <IndicatorCards />
        </div>
        <div className="md:col-span-2 md:row-span-1">
          <div className="grid h-full grid-cols-1 gap-4 lg:grid-cols-2">
            <PositionsTable />
            <OrdersTable />
          </div>
        </div>
      </div>
       <div className="mt-4 grid grid-cols-1 gap-4 md:gap-8">
          <OptionChain />
       </div>
    </main>
  );
}
