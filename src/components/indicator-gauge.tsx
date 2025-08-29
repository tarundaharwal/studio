
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const indicators = [
  {
    name: 'RSI (14)',
    value: 28.7,
    status: 'Oversold',
    color: 'text-green-600',
    progressColor: 'bg-green-600',
  },
  {
    name: 'MACD',
    value: -12.5,
    status: 'Bearish',
    color: 'text-red-600',
    progressColor: 'bg-red-600',
  },
  {
    name: 'ADX (14)',
    value: 45.2,
    status: 'Strong Trend',
    color: 'text-blue-600',
    progressColor: 'bg-blue-600',
  },
  {
    name: 'ATR (14)',
    value: 65.1,
    status: 'High Volatility',
    color: 'text-orange-600',
    progressColor: 'bg-orange-600',
  },
];

export function IndicatorGauge() {
  const getProgressValue = (name: string, value: number) => {
    if (name.includes('RSI')) return value;
    if (name.includes('ADX')) return value;
    if (name.includes('ATR')) return value;
    if (name.includes('MACD')) return (value + 50) / 100 * 100; // Normalize MACD
    return 50;
  }

  return (
    <Card>
      <CardHeader className="p-4">
        <CardTitle>Market Gauges</CardTitle>
        <CardDescription>
          At-a-glance technical indicator readings.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="space-y-4">
          {indicators.map((indicator) => (
            <div key={indicator.name} className="space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-muted-foreground">{indicator.name}</span>
                <span className={indicator.color}>{indicator.status}</span>
              </div>
              <Progress
                value={getProgressValue(indicator.name, indicator.value)}
                className={`h-2 [&>div]:${indicator.progressColor}`}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
