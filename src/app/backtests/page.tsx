import { PlusCircle, File } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from '@/components/ui/table';

const backtests = [
  {
    id: 'BT001',
    strategy: 'RSI Mean Reversion',
    symbol: 'NIFTYBEES',
    timeframe: '15min',
    period: '2023-01-01 to 2023-12-31',
    netPnl: 45230.75,
    winRate: 62.5,
    sharpe: 1.78,
  },
  {
    id: 'BT002',
    strategy: 'SMA Crossover Trend',
    symbol: 'BANKBEES',
    timeframe: '1h',
    period: '2023-06-01 to 2024-05-31',
    netPnl: 89120.20,
    winRate: 55.2,
    sharpe: 1.95,
  },
  {
    id: 'BT003',
    strategy: 'Volatility Breakout',
    symbol: 'NIFTY 50',
    timeframe: '1day',
    period: '2022-01-01 to 2023-12-31',
    netPnl: -12340.50,
    winRate: 35.8,
    sharpe: -0.45,
  },
  {
    id: 'BT004',
    strategy: 'BankNifty Options Scalper',
    symbol: 'BANKNIFTY WKLY',
    timeframe: '5min',
    period: '2024-01-01 to 2024-03-31',
    netPnl: 152030.00,
    winRate: 71.0,
    sharpe: 2.51,
  },
];

export default function BacktestsPage() {
  return (
    <main className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Backtests</h2>
          <p className="text-muted-foreground">
            Analyze the performance of your strategies.
          </p>
        </div>
        <div className="flex items-center gap-2">
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                New Backtest
            </Button>
            <Button size="sm" variant="outline" className="h-9 gap-1">
                <File className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Export
                </span>
            </Button>
        </div>
      </div>

      <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="px-2">ID</TableHead>
              <TableHead className="px-2">Strategy</TableHead>
              <TableHead className="px-2">Symbol</TableHead>
              <TableHead className="px-2">Timeframe</TableHead>
              <TableHead className="px-2">Period</TableHead>
              <TableHead className="px-2 text-right">Net P&L (₹)</TableHead>
              <TableHead className="px-2 text-right">Win Rate (%)</TableHead>
              <TableHead className="px-2 text-right">Sharpe Ratio</TableHead>
              <TableHead className="px-2 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {backtests.map((backtest) => (
              <TableRow key={backtest.id}>
                <TableCell className="p-2">
                  <Badge variant="outline">{backtest.id}</Badge>
                </TableCell>
                <TableCell className="font-medium p-2">{backtest.strategy}</TableCell>
                <TableCell className="p-2">{backtest.symbol}</TableCell>
                <TableCell className="p-2">{backtest.timeframe}</TableCell>
                <TableCell className="font-mono text-xs p-2">{backtest.period}</TableCell>
                <TableCell
                  className={`text-right font-semibold p-2 ${
                    backtest.netPnl >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {backtest.netPnl.toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </TableCell>
                <TableCell className="text-right p-2">{backtest.winRate.toFixed(2)}</TableCell>
                <TableCell className="text-right p-2">{backtest.sharpe.toFixed(2)}</TableCell>
                <TableCell className="text-right p-2">
                    <Button variant="outline" size="sm">View Report</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
    </main>
  );
}
