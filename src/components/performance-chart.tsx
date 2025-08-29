
'use client';

import { ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Area, AreaChart } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { useStore } from '@/store/use-store';

const chartConfig = {
    equity: {
        label: 'Equity',
        color: 'hsl(var(--primary))',
    },
};

export function PerformanceChart() {
  const { chartData, overview } = useStore();
  
  const performanceData = chartData.map((d, i) => {
    // Simplified equity curve logic for visual representation
    // In a real scenario, you'd store historical equity values
    const startingEquity = overview.initialEquity;
    const priceMovement = d.ohlc[3] - chartData[0].ohlc[3];
    // This is a rough estimation for visualization
    const estimatedEquity = startingEquity + overview.pnl + priceMovement * 50; 
    return {
      date: d.time,
      equity: i === chartData.length -1 ? overview.equity : estimatedEquity,
    }
  });

  return (
    <Card>
      <CardHeader className="p-4">
        <CardTitle>Performance</CardTitle>
        <CardDescription>Equity curve over time.</CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="h-[300px]">
        <ChartContainer config={chartConfig} className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                data={performanceData}
                margin={{
                    top: 5,
                    right: 10,
                    left: -10,
                    bottom: 0,
                }}
                >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                    dataKey="date"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => value.substring(0,5)}
                />
                <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `₹${Number(value) / 1000}k`}
                    domain={['dataMin - 50000', 'dataMax + 50000']}
                />
                <Tooltip
                    cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '3 3' }}
                    content={<ChartTooltipContent
                        formatter={(value) => `₹${Number(value).toLocaleString('en-IN', {minimumFractionDigits: 0, maximumFractionDigits: 0})}`}
                        labelClassName="font-bold"
                        indicator="dot"
                    />}
                />
                 <defs>
                    <linearGradient id="fillEquity" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-equity)" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="var(--color-equity)" stopOpacity={0.1}/>
                    </linearGradient>
                </defs>
                <Area
                    type="monotone"
                    dataKey="equity"
                    stroke="var(--color-equity)"
                    strokeWidth={2}
                    dot={false}
                    fill="url(#fillEquity)"
                />
                </AreaChart>
            </ResponsiveContainer>
        </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
