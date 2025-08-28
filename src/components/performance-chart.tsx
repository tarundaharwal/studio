'use client';

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ChartTooltipContent } from '@/components/ui/chart';

const chartData = [
  { date: '2024-07-01', equity: 100000 },
  { date: '2024-07-02', equity: 100500 },
  { date: '2024-07-03', equity: 100200 },
  { date: '2024-07-04', equity: 101000 },
  { date: '2024-07-05', equity: 101500 },
  { date: '2024-07-08', equity: 101300 },
  { date: '2024-07-09', equity: 102000 },
  { date: '2024-07-10', equity: 102500 },
  { date: '2024-07-11', equity: 102300 },
  { date: '2024-07-12', equity: 103000 },
  { date: '2024-07-15', equity: 103200 },
  { date: '2024-07-16', equity: 103800 },
  { date: '2024-07-17', equity: 103500 },
  { date: '2024-07-18', equity: 104200 },
  { date: '2024-07-19', equity: 104800 },
  { date: '2024-07-22', equity: 105000 },
  { date: '2024-07-23', equity: 104500 },
  { date: '2024-07-24', equity: 105200 },
  { date: '2024-07-25', equity: 105800 },
  { date: '2024-07-26', equity: 106300 },
  { date: '2024-07-29', equity: 106250 },
];

export function PerformanceChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance</CardTitle>
        <CardDescription>Equity curve over the last month.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
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
                tickFormatter={(value) => value.substring(5)}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `₹${Number(value) / 1000}k`}
              />
              <Tooltip
                cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '3 3' }}
                content={<ChartTooltipContent
                    formatter={(value) => `₹${Number(value).toLocaleString()}`}
                    labelClassName="font-bold"
                    indicator="dot"
                />}
              />
              <Line
                type="monotone"
                dataKey="equity"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
