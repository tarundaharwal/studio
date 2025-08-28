import { PlusCircle } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';

const strategies = [
  {
    name: 'RSI Mean Reversion',
    description: 'A classic mean-reversion strategy using the RSI oscillator on Nifty Bees.',
    status: 'active',
    pnl: 12540.50,
  },
  {
    name: 'SMA Crossover Trend',
    description: 'A trend-following strategy based on the crossover of two SMAs.',
    status: 'active',
    pnl: 8765.20,
  },
  {
    name: 'Volatility Breakout',
    description: 'A breakout strategy that enters positions when volatility increases.',
    status: 'inactive',
    pnl: -2345.80,
  },
    {
    name: 'BankNifty Options Scalper',
    description: 'A high-frequency scalping strategy for BankNifty weekly options.',
    status: 'active',
    pnl: 21230.00,
  },
];

export default function StrategiesPage() {
  return (
    <main className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Strategies</h2>
          <p className="text-muted-foreground">
            Manage your automated trading strategies.
          </p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Strategy
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {strategies.map((strategy) => (
          <Card key={strategy.name}>
            <CardHeader>
              <CardTitle>{strategy.name}</CardTitle>
              <CardDescription>{strategy.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Status
                </span>
                <Badge
                  variant={strategy.status === 'active' ? 'outline' : 'secondary'}
                  className={
                    strategy.status === 'active'
                      ? 'text-green-600 border-green-600'
                      : 'text-gray-500'
                  }
                >
                  {strategy.status === 'active' ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Total P&L
                </span>
                <span
                  className={`text-sm font-bold ${
                    strategy.pnl >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {strategy.pnl >= 0 ? '+' : ''}₹{strategy.pnl.toFixed(2)}
                </span>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id={`trading-enabled-${strategy.name}`}
                  defaultChecked={strategy.status === 'active'}
                />
                <label
                  htmlFor={`trading-enabled-${strategy.name}`}
                  className="text-sm font-medium"
                >
                  Trading
                </label>
              </div>
              <Button variant="outline" size="sm">
                View
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </main>
  );
}
