
"use client"

import * as React from "react"
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
  Bar,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
  Line,
  Area,
  CartesianGrid,
} from "recharts"
import { ChartContainer } from "@/components/ui/chart"
import { ScrollArea, ScrollBar } from "./ui/scroll-area"
import { Button } from "./ui/button"
import { Minus, Plus, Waves, Tally5 } from "lucide-react"
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group"
import { useStore } from "@/store/use-store"

const MIN_CANDLES = 15;
const ZOOM_STEP = 5;
const CANDLE_WIDTH = 10;

const calculateSMA = (data: any[], period: number) => {
    return data.map((d, i, arr) => {
        if (i < period - 1) return null;
        const slice = arr.slice(i - period + 1, i + 1);
        const sum = slice.reduce((acc, val) => acc + val.ohlc[3], 0);
        return sum / period;
    });
};

const calculateStdDev = (data: number[], period: number) => {
    return data.map((d, i, arr) => {
        if (i < period - 1) return null;
        const slice = arr.slice(i - period + 1, i + 1);
        const mean = slice.reduce((acc, val) => acc + val, 0) / period;
        const sqDiff = slice.map(val => Math.pow(val - mean, 2));
        const avgSqDiff = sqDiff.reduce((acc, val) => acc + val, 0) / period;
        return Math.sqrt(avgSqDiff);
    });
};

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
  sma100: {
      label: "SMA 100",
      color: "hsl(var(--chart-5))",
  },
  bb: {
      label: "Bollinger",
      color: "hsl(var(--chart-2))",
  }
}
  
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      if (!data.ohlc) return null;
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
  const { chartData: fullChartData, timeframe, setTimeframe } = useStore();
  const [visibleCandles, setVisibleCandles] = React.useState(50);
  const [indicator, setIndicator] = React.useState('sma');
  
  const [isClient, setIsClient] = React.useState(false);
  const [livePrice, setLivePrice] = React.useState({
    latestPrice: 0,
    priceChange: 0,
    priceChangePercent: 0,
    isGain: true,
  });

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const chartDataWithIndicators = React.useMemo(() => {
    if (!fullChartData) return [];
    const sma20 = calculateSMA(fullChartData, 20);
    const stdDev20 = calculateStdDev(fullChartData.map(d => d.ohlc[3]), 20);
    const sma50 = calculateSMA(fullChartData, 50);
    const sma100 = calculateSMA(fullChartData, 100);

    return fullChartData.map((d, i) => {
        const [open, high, low, close] = d.ohlc;
        const isGain = close >= open;
        return { 
            ...d, 
            isGain,
            // For candlestick
            price: [open, high, low, close],
            // For recharts <Bar>
            body: [open, close],
            wick: [high, low],
            // Indicators
            sma50: sma50[i],
            sma100: sma100[i],
            bb_middle: sma20[i],
            bb_upper: sma20[i] && stdDev20[i] ? sma20[i]! + (stdDev20[i]! * 2) : null,
            bb_lower: sma20[i] && stdDev20[i] ? sma20[i]! - (stdDev20[i]! * 2) : null,
        }
    });
  }, [fullChartData]);

  const chartData = chartDataWithIndicators.slice(-visibleCandles);
  const maxCandles = fullChartData.length;

  React.useEffect(() => {
    if (fullChartData && fullChartData.length > 1) {
        const latestPrice = fullChartData[fullChartData.length - 1].ohlc[3];
        const previousDayClose = fullChartData[fullChartData.length - 2].ohlc[3];
        const priceChange = latestPrice - previousDayClose;
        const priceChangePercent = previousDayClose !== 0 ? (priceChange / previousDayClose) * 100 : 0;
        const isGain = priceChange >= 0;

        setLivePrice({
            latestPrice,
            priceChange,
            priceChangePercent,
            isGain,
        });
    }
  }, [fullChartData]);


  const handleZoomIn = () => {
    setVisibleCandles(prev => Math.max(MIN_CANDLES, prev - ZOOM_STEP));
  };

  const handleZoomOut = () => {
    setVisibleCandles(prev => Math.min(maxCandles, prev + ZOOM_STEP));
  };
  
  if (!isClient) {
      return (
        <Card className="overflow-hidden h-full flex flex-col">
             <CardHeader className="flex flex-col items-start justify-between border-b p-2 gap-2">
                <div className="h-8 w-40 bg-muted rounded-md animate-pulse" />
                <div className="h-7 w-full bg-muted rounded-md animate-pulse" />
             </CardHeader>
             <CardContent className="p-0 flex-1 bg-muted animate-pulse" />
        </Card>
      )
  }

  const priceDomain = [
    Math.min(...chartData.map(d => d.ohlc[2])),
    Math.max(...chartData.map(d => d.ohlc[1])),
  ];
  const volumeDomain = [
    0,
    Math.max(...chartData.map(d => d.volume)) * 2, // give some headroom
  ];

  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <CardHeader className="flex flex-col items-start justify-between border-b p-2 gap-2">
       <div className="flex flex-row items-center justify-between w-full">
            <div className="flex items-center gap-2">
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
            <div className={`flex items-center gap-2 text-sm text-muted-foreground transition-colors ${livePrice.isGain ? 'text-green-600' : 'text-red-600'}`}>
                <span className="font-medium">{livePrice.latestPrice.toFixed(2)}</span>
                <span className="text-xs">({livePrice.isGain ? '+' : ''}{livePrice.priceChangePercent.toFixed(2)}%)</span>
            </div>
       </div>
       <div className="flex items-center justify-between w-full gap-2">
            <div className="flex items-center gap-1">
                <ToggleGroup type="single" value={timeframe} size="sm" className="h-7" onValueChange={(value) => value && setTimeframe(value)}>
                    <ToggleGroupItem value="1m" className="text-xs px-2 h-full">1M</ToggleGroupItem>
                    <ToggleGroupItem value="5m" className="text-xs px-2 h-full">5M</ToggleGroupItem>
                    <ToggleGroupItem value="15m" className="text-xs px-2 h-full">15M</ToggleGroupItem>
                    <ToggleGroupItem value="1h" className="text-xs px-2 h-full">1H</ToggleGroupItem>
                </ToggleGroup>

                 <ToggleGroup type="single" defaultValue={indicator} size="sm" className="h-7" onValueChange={(value) => value && setIndicator(value)}>
                    <ToggleGroupItem value="sma" className="text-xs px-1 h-full"><Tally5 className="h-4 w-4" /></ToggleGroupItem>
                    <ToggleGroupItem value="bb" className="text-xs px-1 h-full"><Waves className="h-4 w-4" /></ToggleGroupItem>
                </ToggleGroup>
            </div>
            <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleZoomIn} disabled={visibleCandles <= MIN_CANDLES}>
                    <Minus className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleZoomOut} disabled={visibleCandles >= maxCandles}>
                    <Plus className="h-4 w-4" />
                </Button>
            </div>
       </div>

      </CardHeader>
      <CardContent className="p-0 flex-1">
        <ScrollArea className="w-full h-full">
            <ChartContainer 
                config={chartConfig} 
                className="h-full"
                style={{
                    width: '100%',
                    minWidth: `${chartData.length * (CANDLE_WIDTH + 4)}px`,
                }}
            >
              <ComposedChart 
                data={chartData}
                margin={{ top: 20, right: 20, bottom: 20, left: -20 }}
              >
                <CartesianGrid vertical={false} />
                <XAxis dataKey="time" tickLine={false} axisLine={false} tickMargin={8} fontSize={10} interval="preserveStartEnd" />
                <YAxis 
                    yAxisId="price" 
                    orientation="right"
                    domain={priceDomain}
                    tickFormatter={(value) => value.toLocaleString()}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    fontSize={10}
                />
                 <YAxis 
                    yAxisId="volume" 
                    orientation="left"
                    domain={volumeDomain}
                    tickFormatter={(value) => `${(Number(value) / 1000).toFixed(0)}k`}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    fontSize={10}
                    width={80}
                />
                <Tooltip content={<CustomTooltip />} />

                {/* Candlestick Wicks */}
                <Bar dataKey="wick" yAxisId="price" barSize={1} >
                    {chartData.map((d, i) => (
                        <Cell key={`wick-cell-${i}`} fill={d.isGain ? 'hsl(var(--chart-2))' : 'hsl(var(--chart-1))'} />
                    ))}
                </Bar>
                {/* Candlestick Body */}
                <Bar dataKey="body" yAxisId="price" barSize={CANDLE_WIDTH} >
                    {chartData.map((d, i) => (
                        <Cell key={`body-cell-${i}`} fill={d.isGain ? 'hsl(var(--chart-2))' : 'hsl(var(--chart-1))'} />
                    ))}
                </Bar>

                {/* Volume Bars */}
                <Bar dataKey="volume" yAxisId="volume" barSize={CANDLE_WIDTH}>
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${entry.time}-${index}`} fill={entry.isGain ? 'hsla(var(--chart-2), 0.5)' : 'hsla(var(--chart-1), 0.5)'} />
                    ))}
                </Bar>
              </ComposedChart>
            </ChartContainer>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

    