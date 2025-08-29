
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { TrendingUp, Waves, Gauge, Move, HelpCircle } from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    ResponsiveContainer,
    Tooltip,
  } from 'recharts';
import { ChartContainer, ChartTooltipContent } from './ui/chart';
  

const rsiData = [
    { level: '0-10', value: 0 },
    { level: '10-20', value: 0 },
    { level: '20-30', value: 15 },
    { level: '30-40', value: 35 },
    { level: '40-50', value: 45 },
    { level: '50-60', value: 55 },
    { level: '60-70', value: 40 },
    { level: '70-80', value: 20 },
    { level: '80-90', value: 5 },
    { level: '90-100', value: 0 },
];
const chartConfig = {
    value: {
        label: "Value",
        color: "hsl(var(--primary))",
    },
};

export function IndicatorCards() {
  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            RSI (14)
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">58.6</div>
          <p className="text-xs text-muted-foreground">
            Neutral
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            MACD (12, 26, 9)
          </CardTitle>
          <Waves className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">+12.4</div>
          <p className="text-xs text-muted-foreground">
            Bullish Crossover
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">ADX (14)</CardTitle>
          <Gauge className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">28.9</div>
          <p className="text-xs text-muted-foreground">
            Developing Trend
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">ATR (14)</CardTitle>
          <Move className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">45.2</div>
          <p className="text-xs text-muted-foreground">
            Average Volatility
          </p>
        </CardContent>
      </Card>
    </>
  );
}
