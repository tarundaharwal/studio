
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
    Rectangle,
    Cell,
    CartesianGrid,
} from "recharts"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import { ScrollArea, ScrollBar } from "./ui/scroll-area"
import { Button } from "./ui/button"
import { Minus, Plus, CandlestickChart, BarChart3 } from "lucide-react"
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group"
import { useStore, ChartData } from "@/store/use-store"

const MIN_CANDLES = 15;
const ZOOM_STEP = 5;
const CANDLE_WIDTH = 12;

const calculateHeikinAshi = (data: ChartData[]) => {
    const haData: ChartData[] = [];
    data.forEach((d, i) => {
        const [open, high, low, close] = d.ohlc;

        const haClose = (open + high + low + close) / 4;
        let haOpen;

        if (i === 0) {
            haOpen = (open + close) / 2;
        } else {
            const prevHaOpen = haData[i-1].ohlc[0];
            const prevHaClose = haData[i-1].ohlc[3];
            haOpen = (prevHaOpen + prevHaClose) / 2;
        }

        const haHigh = Math.max(high, haOpen, haClose);
        const haLow = Math.min(low, haOpen, haClose);

        haData.push({
            ...d,
            ohlc: [haOpen, haHigh, haLow, haClose],
        });
    });
    return haData;
};

// --- Custom Shape Components for Dynamic Coloring ---

const CustomWick = (props: any) => {
    const { x, y, width, height, payload } = props;
    if (!payload) return null;
    const color = payload.isGain ? 'hsl(var(--chart-2))' : 'hsl(var(--chart-1))';
    return <Rectangle x={x} y={y} width={width} height={height} fill={color} stroke={color} />;
};
  
const CustomBody = (props: any) => {
    const { x, y, width, height, payload } = props;
    if (!payload) return null;
    const color = payload.isGain ? 'hsl(var(--chart-2))' : 'hsl(var(--chart-1))';
    return <Rectangle x={x} y={y} width={width} height={height} fill={color} stroke="none" />;
};

const getVolumeColor = (isGain: boolean) => isGain ? 'hsl(var(--chart-2-light))' : 'hsl(var(--chart-1-light))';

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      // Find the payload for the price chart (it will have 'candleBody')
      const pricePayload = payload.find(p => p.dataKey === 'candleBody');
      const volumePayload = payload.find(p => p.dataKey === 'volume');
      
      if (!pricePayload) return null;

      const data = pricePayload.payload;
      const [open, high, low, close] = data.original_ohlc;

      return (
        <div className="p-2 text-xs bg-background/90 border rounded-md shadow-lg backdrop-blur-sm z-50">
          <p className="font-bold mb-1">{label}</p>
          <div className="grid grid-cols-2 gap-x-2 gap-y-1">
            <span className="text-muted-foreground">O:</span><span className="font-mono text-right">{open.toFixed(2)}</span>
            <span className="text-muted-foreground">H:</span><span className="font-mono text-right">{high.toFixed(2)}</span>
            <span className="text-muted-foreground">L:</span><span className="font-mono text-right">{low.toFixed(2)}</span>
            <span className="text-muted-foreground">C:</span><span className="font-mono text-right">{close.toFixed(2)}</span>
            {volumePayload && <span className="text-muted-foreground">Vol:</span>}
            {volumePayload && <span className="font-mono text-right">{(volumePayload.value / 1000).toFixed(1)}k</span>}
          </div>
        </div>
      );
    }
  
    return null;
  };

export function TradingTerminal() {
  const { chartData: fullChartData, timeframe, setTimeframe, candleType, setCandleType } = useStore();
  const [visibleCandles, setVisibleCandles] = React.useState(50);
  
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
    if (!fullChartData || fullChartData.length === 0) return [];
    
    const baseData = candleType === 'heikin-ashi' ? calculateHeikinAshi(fullChartData) : fullChartData;
    
    return baseData.map((d, i) => {
        const [open, high, low, close] = d.ohlc;
        const isGain = close >= open;
        const originalCandle = fullChartData[i];

        return { 
            ...d,
            candleWick: [low, high], 
            candleBody: [Math.min(open, close), Math.max(open, close)],
            isGain,
            originalIsGain: originalCandle.ohlc[3] >= originalCandle.ohlc[0],
            original_ohlc: originalCandle.ohlc,
        }
    });
  }, [fullChartData, candleType]);

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
                <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* Price Candlestick Chart (Top 75%) */}
                <ResponsiveContainer width="100%" height="75%">
                    <ComposedChart data={chartData} syncId="stockChart" margin={{ top: 20, right: 45, bottom: 0, left: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="time" hide />
                        <YAxis yAxisId="right" orientation="right" domain={['auto', 'auto']} tickFormatter={(value) => value.toLocaleString()} tickLine={false} axisLine={false} tickMargin={8} fontSize={10} width={60}/>
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1, strokeDasharray: '3 3' }}/>
                        
                        <Bar dataKey="candleWick" yAxisId="right" barSize={1} shape={<CustomWick />} isAnimationActive={false} />
                        <Bar dataKey="candleBody" yAxisId="right" barSize={CANDLE_WIDTH} shape={<CustomBody />} isAnimationActive={false} />
                    </ComposedChart>
                </ResponsiveContainer>

                {/* Volume Bar Chart (Bottom 25%) */}
                <ResponsiveContainer width="100%" height="25%">
                    <ComposedChart data={chartData} syncId="stockChart" margin={{ top: 10, right: 45, bottom: 20, left: 5 }}>
                        <XAxis dataKey="time" tickLine={false} axisLine={false} tickMargin={8} fontSize={10} interval="preserveStartEnd" />
                        <YAxis yAxisId="left" orientation="right" domain={['auto', 'auto']} tickFormatter={(value) => `${(Number(value) / 1000).toFixed(0)}k`} tickLine={false} axisLine={false} tickMargin={8} fontSize={10} width={60} />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1, strokeDasharray: '3 3' }}/>
                        
                        <Bar dataKey="volume" yAxisId="left" barSize={CANDLE_WIDTH} isAnimationActive={false}>
                            {chartData.map((entry, index) => (
                            <Cell key={`cell-volume-${index}`} fill={getVolumeColor(entry.isGain)} />
                            ))}
                        </Bar>
                    </ComposedChart>
                </ResponsiveContainer>
                </div>
            </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

    