
import { IndicatorCards } from '@/components/indicator-cards';
import { OptionChain } from '@/components/option-chain';
import { OrdersTable } from '@/components/orders-table';
import { PositionsTable } from '@/components/positions-table';
import { TradingTerminal } from '@/components/trading-terminal';

export default function DashboardPage() {
  return (
    <main className="p-4 md:p-6 h-screen flex flex-col overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 flex-1 h-[calc(100vh-8rem)]">
        {/* Left Column */}
        <div className="flex flex-col gap-4 md:gap-6 flex-[0.7]">
          <div className="flex-[3]"> {/* Takes more space */}
            <TradingTerminal />
          </div>
          <div className="flex-[2]"> {/* Takes less space - made smaller */}
            <OptionChain />
          </div>
        </div>
        {/* Right Column */}
        <div className="flex flex-col gap-4 md:gap-6 flex-[0.3]">
          <div className="flex-[2]">
            <IndicatorCards />
          </div>
          <div className="flex-[1] grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <PositionsTable />
            <OrdersTable />
          </div>
        </div>
      </div>
    </main>
  );
}
