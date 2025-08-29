
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
} from "recharts"
import { ScrollArea, ScrollBar } from "./ui/scroll-area"
import { Button } from "./ui/button"
import { Minus, Plus, CandlestickChart, BarChart3 } from "lucide-react"
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group"
import { useStore } from "@/store/use-store"

// Custom shape for the candlestick wick
const renderWick = (props: any) => {
    const { x, y, width, height, payload } = props;
    const [low, high] = payload.candleWick;
    const isGain = payload.isGain;
  
    return (
      <line
        x1={x + width / 2}
        y1={props.yAxis.scale(low)}
        x2={x + width / 2}
        y2={props.yAxis.scale(high)}
        stroke={isGain ? 'hsl(var(--chart-2))' : 'hsl(var(--chart-1))'}
        strokeWidth={1}
      />
    );
  };
  
// Custom shape for the candlestick body
const renderCandle = (props: any) => {
    const { x, width, payload } = props;
    const { ohlc, isGain } = payload;
    const [open, , , close] = ohlc;
    const candleHeight = Math.abs(props.yAxis.scale(close) - props.yAxis.scale(open));
    const candleY = isGain ? props.yAxis.scale(close) : props.yAxis.scale(open);
    
    return (
      <rect
        x={x}
        y={candleY}
        width={width}
        height={candleHeight}
        fill={isGain ? 'hsl(var(--chart-2))' : 'hsl(var(--chart-1))'}
      />
    );
};

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const ohlc = data.original_ohlc || data.ohlc;
      return (
        <div className="custom-tooltip bg-background/90 text-foreground border-border backdrop-blur-sm">
          <p className="label font-bold">{`Time: ${label}`}</p>
          <p className="font-mono" style={{ color: data.isGain ? 'hsl(var(--chart-2))' : 'hsl(var(--chart-1))' }}>
            {`O: ${ohlc[0].toFixed(2)} H: ${ohlc[1].toFixed(2)} L: ${ohlc[2].toFixed(2)} C: ${ohlc[3].toFixed(2)}`}
          </p>
          <p className="font-mono text-muted-foreground">{`Volume: ${data.volume.toLocaleString()}`}</p>
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
    
    return fullChartData.map((d) => {
        const [open, high, low, close] = d.ohlc;
        const isGain = close >= open;

        return { 
            ...d,
            candleWick: [low, high],
            // For recharts, the body array must always be [min, max]
            candleBody: [Math.min(open, close), Math.max(open, close)], 
            isGain,
            original_ohlc: d.ohlc,
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

  const getDomain = () => {
    const highs = chartData.map(item => item.original_ohlc[1]);
    const lows = chartData.map(item => item.original_ohlc[2]);
    return [Math.min(...lows) * 0.995, Math.max(...highs) * 1.005];
  };

  const getVolumeDomain = () => {
    const volumes = chartData.map(item => item.volume);
    return [0, Math.max(...volumes) * 4]; // Multiply to push volume bars to the bottom
  };


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
                
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                data={chartData}
                margin={{ top: 20, right: 45, left: 5, bottom: 20 }}
                barGap={-CANDLE_WIDTH/2}
                >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="time" tickLine={false} axisLine={false} tickMargin={8} fontSize={10} interval="preserveStartEnd" />
                <YAxis 
                    yAxisId="price" 
                    orientation="right" 
                    domain={getDomain}
                    tickFormatter={(value) => value.toLocaleString()} tickLine={false} axisLine={false} tickMargin={8} fontSize={10} width={60}
                />
                <YAxis 
                    yAxisId="volume" 
                    orientation="left" 
                    domain={getVolumeDomain}
                    hide
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1, strokeDasharray: '3 3' }} />
                
                <Bar
                    yAxisId="price"
                    dataKey="candleWick"
                    shape={renderWick}
                    isAnimationActive={false}
                    barSize={1}
                />
                
                <Bar
                    yAxisId="price"
                    dataKey="candleBody"
                    shape={renderCandle}
                    isAnimationActive={false}
                    barSize={CANDLE_WIDTH}
                />
                
                <Bar
                    yAxisId="volume"
                    dataKey="volume"
                    isAnimationActive={false}
                    barSize={CANDLE_WIDTH}
                    shape={(props: any) => {
                        const { x, y, width, height, payload } = props;
                        return (
                        <rect
                            x={x}
                            y={y}
                            width={width}
                            height={height}
                            fill={payload.isGain ? 'hsl(var(--chart-2-light))' : 'hsl(var(--chart-1-light))'}
                        />
                        );
                    }}
                />
                
                {chartData.length > 0 && (
                    <ReferenceLine
                    yAxisId="price"
                    y={chartData[chartData.length - 1].original_ohlc[3]}
                    stroke="hsl(var(--primary))"
                    strokeDasharray="3 3"
                    strokeWidth={1}
                    label={{ value: ` ${chartData[chartData.length - 1].original_ohlc[3].toFixed(2)}`, position: 'right', fill: 'hsl(var(--primary))', fontSize: 10 }}
                    />
                )}
                </ComposedChart>
            </ResponsiveContainer>

            </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
