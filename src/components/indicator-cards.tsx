
'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { TrendingUp, Waves, Gauge, Move } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';


const generateIndicatorData = (min: number, max: number, count: number) => {
    return Array.from({ length: count }, () => Math.random() * (max - min) + min);
};
  
const chartData = Array.from({ length: 20 }, (_, i) => ({
    x: i,
    rsi: generateIndicatorData(30, 70, 20)[i],
    macd: generateIndicatorData(-15, 15, 20)[i],
    adx: generateIndicatorData(20, 40, 20)[i],
    atr: generateIndicatorData(40, 60, 20)[i],
}));

const chartConfig = {
    value: {
        color: 'hsl(var(--primary))',
    }
};

const TinyChart = ({ dataKey, data, color }: { dataKey: string, data: any[], color: string }) => (
    <div className="h-16 w-full">
        <ChartContainer config={{ [dataKey]: { color } }} className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                    <Tooltip
                        cursor={false}
                        content={<ChartTooltipContent
                            indicator='line'
                            labelClassName='hidden'
                            className='w-20 p-1 text-xs'
                            formatter={(value) => [`${(value as number).toFixed(2)}`, null]}
                        />}
                    />
                    <Area
                        dataKey={dataKey}
                        type="monotone"
                        fill="var(--color-fill)"
                        stroke="var(--color-stroke)"
                        strokeWidth={2}
                        dot={false}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </ChartContainer>
    </div>
);


export function IndicatorCards() {
  return (
    <>
      <Card className="col-span-1 flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-2 pb-0 md:p-4 md:pb-2">
          <CardTitle className="text-xs font-medium">
            RSI (14)
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="flex-1 p-2 pt-0 md:p-4 md:pt-0">
          <div className="text-lg md:text-2xl font-bold mb-2">58.6</div>
          <TinyChart dataKey="rsi" data={chartData} color="hsl(var(--chart-1))" />
        </CardContent>
      </Card>

      <Card className="col-span-1 flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-2 pb-0 md:p-4 md:pb-2">
          <CardTitle className="text-xs font-medium">
            MACD
          </CardTitle>
          <Waves className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="flex-1 p-2 pt-0 md:p-4 md:pt-0">
          <div className="text-lg md:text-2xl font-bold text-green-600 mb-2">+12.4</div>
          <TinyChart dataKey="macd" data={chartData} color="hsl(var(--chart-2))" />
        </CardContent>
      </Card>

      <Card className="col-span-1 flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-2 pb-0 md:p-4 md:pb-2">
          <CardTitle className="text-xs font-medium">ADX (14)</CardTitle>
          <Gauge className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="flex-1 p-2 pt-0 md:p-4 md:pt-0">
          <div className="text-lg md:text-2xl font-bold mb-2">28.9</div>
          <TinyChart dataKey="adx" data={chartData} color="hsl(var(--chart-3))" />
        </CardContent>
      </Card>
      
      <Card className="col-span-1 flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-2 pb-0 md:p-4 md:pb-2">
          <CardTitle className="text-xs font-medium">ATR (14)</CardTitle>
          <Move className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="flex-1 p-2 pt-0 md:p-4 md:pt-0">
          <div className="text-lg md:text-2xl font-bold mb-2">45.2</div>
          <TinyChart dataKey="atr" data={chartData} color="hsl(var(--chart-4))" />
        </CardContent>
      </Card>
    </>
  );
}
