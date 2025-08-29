
"use client"

import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"

// Generate more realistic OHLC data
const generateCandlestickData = (count: number) => {
  let lastClose = 22750
  const data = []
  for (let i = 0; i < count; i++) {
    const open = lastClose + (Math.random() - 0.5) * 10;
    const high = Math.max(open, lastClose) + Math.random() * 15;
    const low = Math.min(open, lastClose) - Math.random() * 15;
    const close = low + Math.random() * (high - low);
    lastClose = close;
    data.push({
      time: `${String(9 + Math.floor((i * 5) / 60)).padStart(2, '0')}:${String(
        (i * 5) % 60
      ).padStart(2, '0')}`,
      ohlc: [open, high, low, close],
    })
  }
  return data
}

const chartData = generateCandlestickData(50); // Reduced data points for better fit

const chartConfig = {
  price: {
    label: "Price",
  },
}

// Custom shape for candlestick
const Candlestick = (props: any) => {
    const { x, y, width, height, ohlc } = props;
    if (!ohlc) return null;
    const [open, high, low, close] = ohlc;
    const isGain = close >= open;
    const fill = isGain ? 'hsl(var(--chart-2))' : 'hsl(var(--chart-1))';
    const stroke = fill;
  
    const bodyHeight = Math.abs(open - close);
    const bodyY = isGain ? y + (height - bodyHeight) : y;
  
    return (
      <g stroke={stroke} fill="none" strokeWidth={1.5}>
        {/* Wick */}
        <path d={`M ${x + width / 2} ${y} L ${x + width / 2} ${y + height}`} />
        {/* Body */}
        <rect x={x} y={bodyY} width={width} height={bodyHeight} fill={fill} />
      </g>
    );
  };
  

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const [open, high, low, close] = data.ohlc;
      return (
        <div className="p-2 text-xs bg-background border rounded-md shadow-lg">
          <p className="font-bold">{label}</p>
          <p>O: <span className="font-mono">{open.toFixed(2)}</span></p>
          <p>H: <span className="font-mono">{high.toFixed(2)}</span></p>
          <p>L: <span className="font-mono">{low.toFixed(2)}</span></p>
          <p>C: <span className="font-mono">{close.toFixed(2)}</span></p>
        </div>
      );
    }
  
    return null;
  };

export function TradingTerminal() {
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between border-b px-4 py-2">
        <div>
          <Select defaultValue="NIFTY 50">
            <SelectTrigger className="w-40 border-0 text-base font-bold shadow-none focus:ring-0 h-8">
              <SelectValue placeholder="Select Instrument" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NIFTY 50">NIFTY 50</SelectItem>
              <SelectItem value="BANKNIFTY">BANKNIFTY</SelectItem>
              <SelectItem value="NIFTYBEES">NIFTYBEES</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-medium text-green-600">22,780.50</span>
          <span className="text-green-600 text-xs">(+0.34%)</span>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-1">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 15, right: 15, bottom: 0, left: -25 }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="time" tickLine={false} axisLine={false} tickMargin={8} fontSize={10} interval={8} />
              <YAxis
                domain={['dataMin - 50', 'dataMax + 50']}
                orientation="right"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={10}
              />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                content={<CustomTooltip />}
              />
               <Bar
                dataKey="ohlc"
                shape={<Candlestick />}
              />
            </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
      </CardContent>
    </Card>
  )
}
