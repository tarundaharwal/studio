
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
    ComposedChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Rectangle,
    CartesianGrid,
    ReferenceLine,
    Cell,
} from "recharts"
import { ScrollArea, ScrollBar } from "./ui/scroll-area"
import { Button } from "./ui/button"
import { Minus, Plus, CandlestickChart, BarChart3 } from "lucide-react"
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group"
import { useStore } from "@/store/use-store"

// Custom shape for the candlestick wick
const CustomWick = (props: any) => {
    const { x, y, width, height, payload } = props;
    if (!payload) return null;
    const color = payload.isGain ? 'hsl(var(--chart-2))' : 'hsl(var(--chart-1))';
    return <Rectangle x={x} y={y} width={width} height={height} fill={color} stroke={color} />;
};

// Custom shape for the candlestick body
const CustomBody = (props: any) => {
    const { x, y, width, height, payload } = props;
    if (!payload) return null;
    const color = payload.isGain ? 'hsl(var(--chart-2))' : 'hsl(var(--chart-1))';
    return <Rectangle x={x} y={y} width={width} height={height} fill={color} stroke={color} />;
};


// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      if (!data) return null;

      // Find price and volume data from the payload array
      const pricePayload = payload.find(p => p.dataKey === 'candleBody' || p.dataKey === 'candleWick');
      const volumePayload = payload.find(p => p.dataKey === 'volume');

      return (
        <div className="custom-tooltip bg-background/90 text-foreground border-border backdrop-blur-sm p-2 rounded-md shadow-lg text-xs">
          <p className="label font-bold">{`Time: ${label}`}</p>
          {pricePayload && (
             <p className="font-mono" style={{ color: data.isGain ? 'hsl(var(--chart-2))' : 'hsl(var(--chart-1))' }}>
                {`O: ${data.ohlc[0].toFixed(2)} H: ${data.ohlc[1].toFixed(2)} L: ${data.ohlc[2].toFixed(2)} C: ${data.ohlc[3].toFixed(2)}`}
            </p>
          )}
          {volumePayload && (
             <p className="font-mono text-muted-foreground">{`Volume: ${data.volume.toLocaleString()}`}</p>
          )}
        </div>
      );
    }
    return null;
};

const MIN_CANDLES = 15;
const ZOOM_STEP = 5;
const CANDLE_WIDTH = 12;

export function TradingTerminal() {
  const { chartData: fullChartData, timeframe, setTimeframe, candleType, setCandleType } = useStore();
  const [visibleCandles, setVisibleCandles] = React.useState(50);
  
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);
  
  const chartDataWithIndicators = React.useMemo(() => {
    if (!fullChartData || fullChartData.length === 0) return [];
    
    return fullChartData.map((d) => {
        const [open, high, low, close] = d.ohlc;
        const isGain = close >= open;

        return { 
            ...d,
            candleWick: [low, high],
            candleBody: [Math.min(open, close), Math.max(open, close)], 
            isGain,
        }
    });
  }, [fullChartData]);

  const chartData = chartDataWithIndicators.slice(-visibleCandles);
  const maxCandles = fullChartData.length;

  const livePrice = React.useMemo(() => {
    if (!fullChartData || fullChartData.length < 2) {
        return { latestPrice: 0, priceChange: 0, priceChangePercent: 0, isGain: true };
    }
    const latestPrice = fullChartData[fullChartData.length - 1].ohlc[3];
    const previousDayClose = fullChartData[fullChartData.length - 2].ohlc[3];
    const priceChange = latestPrice - previousDayClose;
    const priceChangePercent = previousDayClose !== 0 ? (priceChange / previousDayClose) * 100 : 0;
    const isGain = priceChange >= 0;

    return { latestPrice, priceChange, priceChangePercent, isGain };
  }, [fullChartData]);

  const handleZoomIn = () => {
    setVisibleCandles(prev => Math.max(MIN_CANDLES, prev - ZOOM_STEP));
  };

  const handleZoomOut = () => {
    setVisibleCandles(prev => Math.min(maxCandles, prev + ZOOM_STEP));
  };
  
  if (!isClient || !chartData.length) {
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

  const getPriceDomain = () => {
    if (chartData.length === 0) return [0,0];
    const highs = chartData.map(item => item.ohlc[1]);
    const lows = chartData.map(item => item.ohlc[2]);
    return [Math.min(...lows) * 0.995, Math.max(...highs) * 1.005];
  };

  const getVolumeDomain = () => {
    if (chartData.length === 0) return [0,0];
    const volumes = chartData.map(item => item.volume);
    return [0, Math.max(...volumes) * 2]; // Give volume bars some room
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
                
                <ToggleGroup type="single" value={candleType} size="sm" className="h-7" onValueChange={(value) => value && setCandleType(value as any)}>
                    <ToggleGroupItem value="candlestick" className="text-xs px-1 h-full"><CandlestickChart className="h-4 w-4" /></ToggleGroupItem>
                    <ToggleGroupItem value="heikin-ashi" className="text-xs px-1 h-full"><BarChart3 className="h-4 w-4" /></ToggleGroupItem>
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
            <div className="h-full" style={{ width: '100%', minWidth: `${chartData.length * (CANDLE_WIDTH + 4)}px` }}>
                
                {/* Price Chart */}
                <ResponsiveContainer width="100%" height="70%">
                    <ComposedChart
                        data={chartData}
                        syncId="stockChart"
                        margin={{ top: 10, right: 45, left: 5, bottom: 0 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <YAxis
                            yAxisId="price"
                            orientation="right"
                            domain={getPriceDomain}
                            tickFormatter={(value) => value.toLocaleString()}
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            fontSize={10}
                            width={60}
                        />
                        <XAxis dataKey="time" hide />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1, strokeDasharray: '3 3' }} />

                        <Bar dataKey="candleWick" yAxisId="price" barSize={1} shape={<CustomWick />} isAnimationActive={false}/>
                        <Bar dataKey="candleBody" yAxisId="price" barSize={CANDLE_WIDTH} shape={<CustomBody />} isAnimationActive={false}/>

                        {chartData.length > 0 && (
                            <ReferenceLine
                                yAxisId="price"
                                y={chartData[chartData.length - 1].ohlc[3]}
                                stroke="hsl(var(--primary))"
                                strokeDasharray="3 3"
                                strokeWidth={1}
                                label={{ value: ` ${chartData[chartData.length - 1].ohlc[3].toFixed(2)}`, position: 'right', fill: 'hsl(var(--primary))', fontSize: 10 }}
                            />
                        )}
                    </ComposedChart>
                </ResponsiveContainer>

                {/* Volume Chart */}
                <ResponsiveContainer width="100%" height="30%">
                    <ComposedChart
                        data={chartData}
                        syncId="stockChart"
                        margin={{ top: 10, right: 45, left: 5, bottom: 20 }}
                    >
                        <YAxis
                            yAxisId="volume"
                            orientation="right"
                            domain={getVolumeDomain}
                            tickFormatter={(value) => `${(Number(value) / 1000).toFixed(0)}k`}
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            fontSize={10}
                            width={60}
                        />
                         <XAxis dataKey="time" tickLine={false} axisLine={false} tickMargin={8} fontSize={10} interval="preserveStartEnd" />
                         <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1, strokeDasharray: '3 3' }} />

                        <Bar yAxisId="volume" dataKey="volume" barSize={CANDLE_WIDTH} isAnimationActive={false}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.isGain ? 'hsl(var(--chart-2-light))' : 'hsl(var(--chart-1-light))'} />
                            ))}
                        </Bar>
                    </ComposedChart>
                </ResponsiveContainer>

            </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
