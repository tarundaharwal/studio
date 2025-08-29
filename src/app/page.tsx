
import { IndicatorCards } from '@/components/indicator-cards';
import { OptionChain } from '@/components/option-chain';
import { OrdersTable } from '@/components/orders-table';
import { PositionsTable } from '@/components/positions-table';
import { TradingTerminal } from '@/components/trading-terminal';

export default function DashboardPage() {
  return (
    <main className="h-screen flex flex-col overflow-hidden p-4 md:p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 flex-1 h-[calc(100vh-5rem)]">
        {/* Top-Left */}
        <div className="flex flex-col">
          <TradingTerminal />
        </div>
        {/* Top-Right */}
        <div className="flex flex-col">
          <IndicatorCards />
        </div>
        {/* Bottom-Left */}
        <div className="flex flex-col">
          <OptionChain />
        </div>
        {/* Bottom-Right */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <PositionsTable />
          <OrdersTable />
        </div>
      </div>
    </main>
  );
}
