
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
  LineChart,
  Line,
  ComposedChart,
} from "recharts"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import { ScrollArea, ScrollBar } from "./ui/scroll-area"

// Helper to calculate SMA
const calculateSMA = (data: any[], period: number) => {
    const sma = [];
    for (let i = 0; i < data.length; i++) {
        if (i < period - 1) {
            sma.push(null);
        } else {
            const sum = data.slice(i - period + 1, i + 1).reduce((acc: any, val: any) => acc + val.ohlc[3], 0);
            sma.push(sum / period);
        }
    }
    return sma;
};


// Generate more realistic OHLCV data
const generateCandlestickData = (count: number) => {
  let lastClose = 22750
  const data = []
  for (let i = 0; i < count; i++) {
    const open = lastClose + (Math.random() - 0.5) * 20;
    const high = Math.max(open, lastClose) + Math.random() * 25;
    const low = Math.min(open, lastClose) - Math.random() * 25;
    const close = low + Math.random() * (high - low);
    const volume = Math.random() * 1000000 + 500000;
    lastClose = close;
    data.push({
      time: `${String(9 + Math.floor((i * 5) / 60)).padStart(2, '0')}:${String(
        (i * 5) % 60
      ).padStart(2, '0')}`,
      ohlc: [open, high, low, close],
      volume: volume,
    })
  }

  const sma50 = calculateSMA(data, 50);
  const sma200 = calculateSMA(data, 20); // Using 20 for visibility on smaller dataset

  return data.map((d, i) => ({ ...d, sma50: sma50[i], sma200: sma200[i] }));
}

const chartData = generateCandlestickData(78); // 5-min candles for a trading day

const chartConfig = {
  price: {
    label: "Price",
  },
  volume: {
    label: "Volume",
  },
  sma50: {
      label: "SMA 50",
      color: "hsl(var(--chart-4))",
  },
  sma200: {
      label: "SMA 20",
      color: "hsl(var(--chart-5))",
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
  
    const bodyHeight = Math.max(1, Math.abs(y - (y + height - Math.abs(open-close)) ));
    const bodyY = isGain ? y + (height - bodyHeight) : y;
  
    return (
      <g stroke={stroke} fill="none" strokeWidth={1}>
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
        <div className="p-2 text-xs bg-background/90 border rounded-md shadow-lg backdrop-blur-sm">
          <p className="font-bold mb-1">{label}</p>
          <div className="grid grid-cols-2 gap-x-2 gap-y-1">
            <span className="text-muted-foreground">O:</span><span className="font-mono text-right">{open.toFixed(2)}</span>
            <span className="text-muted-foreground">H:</span><span className="font-mono text-right">{high.toFixed(2)}</span>
            <span className="text-muted-foreground">L:</span><span className="font-mono text-right">{low.toFixed(2)}</span>
            <span className="text-muted-foreground">C:</span><span className="font-mono text-right">{close.toFixed(2)}</span>
            <span className="text-muted-foreground">Vol:</span><span className="font-mono text-right">{(data.volume / 1000).toFixed(1)}k</span>
          </div>
        </div>
      );
    }
  
    return null;
  };

export function TradingTerminal() {
  const chartWidth = chartData.length * 12;

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
        <ScrollArea className="w-full h-full whitespace-nowrap">
            <div style={{ width: chartWidth, height: '100%' }}>
                <ChartContainer config={chartConfig} className="h-full w-full">
                    {/* Main Price Chart */}
                    <ResponsiveContainer width="100%" height="70%">
                        <ComposedChart
                            data={chartData}
                            margin={{ top: 10, right: 15, bottom: 0, left: -25 }}
                        >
                            <CartesianGrid vertical={false} strokeDasharray="3 3" />
                            <XAxis dataKey="time" tickLine={false} axisLine={false} tickMargin={8} fontSize={9} interval={6} tick={false} />
                            <YAxis
                                yAxisId="left"
                                domain={['dataMin - 50', 'dataMax + 50']}
                                orientation="right"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                fontSize={9}
                            />
                            <Tooltip
                                content={<CustomTooltip />}
                                cursor={{ strokeDasharray: '3 3' }}
                            />
                            <Bar
                                dataKey="ohlc"
                                shape={<Candlestick />}
                                yAxisId="left"
                                barSize={8}
                            />
                            <Line type="monotone" dataKey="sma50" stroke="var(--color-sma50)" strokeWidth={2} dot={false} yAxisId="left" name="SMA 50"/>
                            <Line type="monotone" dataKey="sma200" stroke="var(--color-sma200)" strokeWidth={2} dot={false} yAxisId="left" name="SMA 20"/>
                        </ComposedChart>
                    </ResponsiveContainer>
                    
                    {/* Volume Chart */}
                    <ResponsiveContainer width="100%" height="30%">
                        <BarChart
                            data={chartData}
                            margin={{ top: 5, right: 15, bottom: 15, left: -25 }}
                        >
                            <CartesianGrid vertical={false} strokeDasharray="3 3" />
                            <XAxis dataKey="time" tickLine={false} axisLine={false} tickMargin={8} fontSize={9} interval={6} />
                            <YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} tickMargin={8} fontSize={9} tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                            <Tooltip
                                cursor={{ strokeDasharray: '3 3' }}
                                content={<></>}
                            />
                            <Bar dataKey="volume" yAxisId="right" barSize={8}>
                                {chartData.map((entry, index) => (
                                    <rect key={`bar-${index}`} fill={entry.ohlc[3] >= entry.ohlc[0] ? 'hsl(var(--chart-2)/0.5)' : 'hsl(var(--chart-1)/0.5)'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
