
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useStore } from '@/store/use-store';

export function IndicatorGauge() {
  const { indicators } = useStore();

  const getIndicatorStyle = (name: string, value: number) => {
    if (name.includes('RSI')) {
      if (value > 70) return { status: 'Overbought', color: 'text-red-600', progressColor: 'bg-red-600' };
      if (value < 30) return { status: 'Oversold', color: 'text-green-600', progressColor: 'bg-green-600' };
      return { status: 'Neutral', color: 'text-gray-500', progressColor: 'bg-gray-500' };
    }
    if (name.includes('MACD')) {
      if (value > 1) return { status: 'Bullish', color: 'text-green-600', progressColor: 'bg-green-600' };
      if (value < -1) return { status: 'Bearish', color: 'text-red-600', progressColor: 'bg-red-600' };
      return { status: 'Neutral', color: 'text-gray-500', progressColor: 'bg-gray-500' };
    }
    if (name.includes('ADX')) {
      if (value > 40) return { status: 'Strong Trend', color: 'text-blue-600', progressColor: 'bg-blue-600' };
      return { status: 'Weak Trend', color: 'text-yellow-600', progressColor: 'bg-yellow-600' };
    }
    return { status: '', color: '', progressColor: 'bg-primary' };
  };

  const getProgressValue = (name: string, value: number) => {
    if (name.includes('RSI')) return value;
    if (name.includes('ADX')) return value;
    if (name.includes('ATR')) return value;
    if (name.includes('MACD')) return (value + 50); // Normalize MACD for progress
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
          {indicators.map((indicator) => {
            const { status, color, progressColor } = getIndicatorStyle(indicator.name, indicator.value);
            return (
              <div key={indicator.name} className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-muted-foreground">
                    {indicator.name}: <span className="font-bold text-foreground">{indicator.value.toFixed(2)}</span>
                  </span>
                  <span className={color}>{status}</span>
                </div>
                <Progress
                  value={getProgressValue(indicator.name, indicator.value)}
                  className={`h-2 [&>div]:${progressColor}`}
                />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
