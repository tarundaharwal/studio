
'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { TrendingUp } from 'lucide-react';
import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const generateIndicatorData = (min: number, max: number, count: number) => {
    return Array.from({ length: count }, () => Math.random() * (max - min) + min);
};

const chartData = Array.from({ length: 20 }, (_, i) => ({
    x: `Point ${i + 1}`,
    rsi: generateIndicatorData(30, 70, 20)[i],
    macd: generateIndicatorData(-15, 15, 20)[i],
    adx: generateIndicatorData(20, 40, 20)[i],
    atr: generateIndicatorData(40, 60, 20)[i],
}));

const chartConfig = {
    rsi: {
        label: 'RSI',
        color: 'hsl(var(--chart-1))',
    },
    macd: {
        label: 'MACD',
        color: 'hsl(var(--chart-2))',
    },
    adx: {
        label: 'ADX',
        color: 'hsl(var(--chart-3))',
    },
    atr: {
        label: 'ATR',
        color: 'hsl(var(--chart-4))',
    },
};

export function IndicatorCards() {
  return (
    <Card className="h-full flex flex-col">
        <CardHeader className="py-4">
          <CardTitle>Market Indicators</CardTitle>
          <CardDescription className="text-xs">RSI, MACD, ADX, and ATR</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 p-0">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 0, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                    dataKey="x"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => ''} // Hide X-axis labels to keep it clean
                />
                 <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    width={30}
                    fontSize={9}
                />
                <Tooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                />
                <ChartLegend content={<ChartLegendContent />} />
                <Line dataKey="rsi" type="monotone" stroke="var(--color-rsi)" strokeWidth={2} dot={false} />
                <Line dataKey="macd" type="monotone" stroke="var(--color-macd)" strokeWidth={2} dot={false} />
                <Line dataKey="adx" type="monotone" stroke="var(--color-adx)" strokeWidth={2} dot={false} />
                <Line dataKey="atr" type="monotone" stroke="var(--color-atr)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
  );
}
