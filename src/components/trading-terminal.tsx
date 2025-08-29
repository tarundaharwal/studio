
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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  Cell,
} from "recharts"
import { ChartContainer } from "@/components/ui/chart"
import { ScrollArea, ScrollBar } from "./ui/scroll-area"
import { Button } from "./ui/button"
import { Minus, Plus, Waves, Tally5 } from "lucide-react"
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group"
import { useStore } from "@/store/use-store"

const MIN_CANDLES = 15;
const ZOOM_STEP = 5;
const CANDLE_WIDTH = 16;

// Helper to calculate SMA
const calculateSMA = (data: any[], period: number) => {
    return data.map((d, i, arr) => {
        if (i < period - 1) return null;
        const slice = arr.slice(i - period + 1, i + 1);
        const sum = slice.reduce((acc, val) => acc + val.ohlc[3], 0);
        return sum / period;
    });
};

// Helper to calculate Standard Deviation for Bollinger Bands
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

// Custom shape for candlestick
const Candlestick = (props: any) => {
    const { x, y, width, height, ohlc } = props;
    if (!ohlc) return null;
    const [open, high, low, close] = ohlc;
    const isGain = close >= open;
    const fill = isGain ? 'hsl(var(--chart-2))' : 'hsl(var(--chart-1))';
    const stroke = fill;

    const priceRange = high - low;

    // Handle the case where high equals low to prevent division by zero
    if (priceRange === 0) {
      const bodyY = y + height / 2;
      return (
        <g stroke={stroke} fill="none" strokeWidth={1}>
          {/* Wick (a single vertical line) */}
          <path d={`M ${x + width / 2} ${y} L ${x + width / 2} ${y + height}`} />
          {/* Body (a single horizontal line) */}
          <path d={`M ${x} ${bodyY} L ${x + width} ${bodyY}`} />
        </g>
      );
    }
  
    const bodyHeight = Math.abs(height * (open - close) / priceRange) || 1; // Ensure minimum 1px height
    const bodyY = isGain 
      ? y + (height * (high - close) / priceRange)
      : y + (height * (high - open) / priceRange);

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
    const sma20 = calculateSMA(fullChartData, 20);
    const stdDev20 = calculateStdDev(fullChartData.map(d => d.ohlc[3]), 20);
    const sma50 = calculateSMA(fullChartData, 50);
    const sma100 = calculateSMA(fullChartData, 100);

    return fullChartData.map((d, i) => ({ 
        ...d, 
        sma50: sma50[i],
        sma100: sma100[i],
        bb_middle: sma20[i],
        bb_upper: sma20[i] && stdDev20[i] ? sma20[i]! + (stdDev20[i]! * 2) : null,
        bb_lower: sma20[i] && stdDev20[i] ? sma20[i]! - (stdDev20[i]! * 2) : null,
    }));
  }, [fullChartData]);

  const chartData = chartDataWithIndicators.slice(-visibleCandles);
  const maxCandles = fullChartData.length;

  React.useEffect(() => {
    if (fullChartData && fullChartData.length > 1) {
        const latestPrice = fullChartData[fullChartData.length - 1].ohlc[3];
        const previousDayClose = fullChartData[fullChartData.length - 2].ohlc[3]; // Or a proper daily close
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
                    minWidth: `${chartData.length * CANDLE_WIDTH}px`,
                }}
            >
                {/* Main Price Chart */}
                <ResponsiveContainer width="100%" height="70%">
                    <ComposedChart
                        data={chartData}
                        margin={{ top: 10, right: 15, bottom: 0, left: -25 }}
                    >
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis dataKey="time" tickLine={false} axisLine={false} tickMargin={8} fontSize={9} interval="preserveStartEnd" />
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
                            barSize={CANDLE_WIDTH * 0.7}
                        >
                           {chartData.map((entry, index) => {
                                const [open, , , close] = entry.ohlc;
                                const fill = close >= open ? 'hsl(var(--chart-2))' : 'hsl(var(--chart-1))';
                                return <Cell key={`cell-${index}`} fill={fill} />;
                            })}
                        </Bar>
                         {indicator === 'sma' && (
                            <>
                                <Line type="monotone" dataKey="sma50" stroke="var(--color-sma50)" strokeWidth={2} dot={false} yAxisId="left" name="SMA 50"/>
                                <Line type="monotone" dataKey="sma100" stroke="var(--color-sma100)" strokeWidth={2} dot={false} yAxisId="left" name="SMA 100"/>
                            </>
                        )}
                        {indicator === 'bb' && (
                            <>
                                <Line type="monotone" dataKey="bb_middle" stroke="var(--color-bb)" strokeWidth={1.5} dot={false} yAxisId="left" name="BB Middle" />
                                <Area type="monotone" dataKey="bb_upper" fill="var(--color-bb)" fillOpacity={0.1} stroke="var(--color-bb)" strokeWidth={1.5} dot={false} yAxisId="left" name="BB Upper" connectNulls/>
                                <Area type="monotone" dataKey="bb_lower" fill="var(--color-bb)" fillOpacity={0.1} stroke="var(--color-bb)" strokeWidth={1.5} dot={false} yAxisId="left" name="BB Lower" connectNulls/>
                            </>
                        )}
                    </ComposedChart>
                </ResponsiveContainer>
                
                {/* Volume Chart */}
                <ResponsiveContainer width="100%" height="30%">
                    <BarChart
                        data={chartData}
                        margin={{ top: 5, right: 15, bottom: 15, left: -25 }}
                        barGap={1}
                    >
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis dataKey="time" tickLine={false} axisLine={false} tickMargin={8} fontSize={9} interval="preserveStartEnd" />
                        <YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} tickMargin={8} fontSize={9} tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                        <Tooltip
                            cursor={{ strokeDasharray: '3 3' }}
                            position={{ y: 5 }}
                            contentStyle={{ display: 'none' }}
                        />
                        <Bar dataKey="volume" yAxisId="right" barSize={CANDLE_WIDTH * 0.7}>
                            {chartData.map((entry, index) => {
                                const [open, , , close] = entry.ohlc;
                                const fill = close >= open ? 'hsl(var(--chart-2))' : 'hsl(var(--chart-1))';
                                return <Cell key={`cell-${index}`} fill={fill} />;
                            })}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </ChartContainer>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
