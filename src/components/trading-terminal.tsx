
"use client"

import * as React from "react"
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
  Brush,
  AreaChart,
  Area,
  Line,
} from "recharts"
import { useStore } from "@/store/use-store"
import { Card, CardContent, CardHeader } from "./ui/card"
import { Button } from "./ui/button"
import { Waves } from "lucide-react"
import { Toggle } from "./ui/toggle"
import { Tooltip as UiTooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"


// Custom shape for the candlestick wick (thin line-like bar)
const CustomWick = (props: any) => {
    const { x, y, width, height, payload } = props;
    if (!payload || height <= 0) return null;
    const color = payload.isGain ? 'hsl(var(--chart-2))' : 'hsl(var(--chart-1))';
    return <Rectangle x={x + width / 2 - 0.5} y={y} width={1} height={height} fill={color} />;
};

// Custom shape for the candlestick body (thicker bar)
const CustomBody = (props: any) => {
    const { x, y, width, height, payload } = props;
    if (!payload || height <= 0) return null;
    const color = payload.isGain ? 'hsl(var(--chart-2))' : 'hsl(var(--chart-1))';
    return <Rectangle x={x} y={y} width={width} height={height} fill={color} />;
};

const getVolumeColor = (isGain: boolean) => isGain ? 'hsl(var(--chart-2-light))' : 'hsl(var(--chart-1-light))';


// Custom tooltip for the Price Chart
const PriceTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      if (!data) return null;

      return (
        <div className="custom-tooltip bg-background/90 text-foreground border-border backdrop-blur-sm p-2 rounded-md shadow-lg text-xs">
          <p className="label font-bold">{`Time: ${label}`}</p>
          <p className="font-mono" style={{ color: data.isGain ? 'hsl(var(--chart-2))' : 'hsl(var(--chart-1))' }}>
                {`O: ${data.ohlc[0].toFixed(2)} H: ${data.ohlc[1].toFixed(2)} L: ${data.ohlc[2].toFixed(2)} C: ${data.ohlc[3].toFixed(2)}`}
            </p>
            {data.ema9 && <p className="font-mono" style={{color: 'hsl(var(--chart-4))'}}>{`EMA(9): ${data.ema9.toFixed(2)}`}</p>}
            {data.ema21 && <p className="font-mono" style={{color: 'hsl(var(--chart-5))'}}>{`EMA(21): ${data.ema21.toFixed(2)}`}</p>}
        </div>
      );
    }
    return null;
};

// Custom tooltip for the Volume Chart
const VolumeTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      if (!data || !data.volume) return null;

      return (
        <div className="custom-tooltip bg-background/90 text-foreground border-border backdrop-blur-sm p-2 rounded-md shadow-lg text-xs">
          <p className="font-mono text-muted-foreground">{`Volume: ${data.volume.toLocaleString()}`}</p>
        </div>
      );
    }
    return null;
};

// Custom Tooltip content for the Brush chart to avoid the React warning
const BrushTooltipContent = (props: any) => {
    // We don't need to render anything, this is just to catch the props
    // that recharts passes down, preventing them from reaching a DOM element.
    return null;
};


const CANDLE_WIDTH = 12;
const VISIBLE_CANDLES = 50;

const calculateEMA = (data: number[], period: number): (number | null)[] => {
    if (data.length < period) return Array(data.length).fill(null);
    
    const ema: (number | null)[] = Array(period - 1).fill(null);
    let firstSma = data.slice(0, period).reduce((sum, val) => sum + val, 0) / period;
    ema.push(firstSma);
    
    const multiplier = 2 / (period + 1);
    
    for (let i = period; i < data.length; i++) {
      const prevEma = ema[i - 1];
      if (prevEma === null) {
          ema.push(null);
          continue;
      }
      const newEma = (data[i] - prevEma) * multiplier + prevEma;
      ema.push(newEma);
    }
    
    return ema;
};


export function TradingTerminal() {
  const { chartData: fullChartData } = useStore();
  const [startIndex, setStartIndex] = React.useState(0);
  const [endIndex, setEndIndex] = React.useState(fullChartData.length - 1);
  const [visibleIndicators, setVisibleIndicators] = React.useState({
      ema9: false,
      ema21: false,
  });
  
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
    if (fullChartData.length > 0) {
      const newEndIndex = fullChartData.length - 1;
      const newStartIndex = Math.max(0, newEndIndex - VISIBLE_CANDLES + 1);
      setEndIndex(newEndIndex);
      setStartIndex(newStartIndex);
    }
  }, [fullChartData.length]);
  
  const chartDataWithIndicators = React.useMemo(() => {
    if (!fullChartData || fullChartData.length === 0) return [];

    const closePrices = fullChartData.map(d => d.ohlc[3]);
    const ema9Data = calculateEMA(closePrices, 9);
    const ema21Data = calculateEMA(closePrices, 21);
    
    return fullChartData.map((d, i) => {
        const [open, high, low, close] = d.ohlc;
        const isGain = close >= open;

        return { 
            ...d,
            candleWick: [low, high],
            candleBody: [Math.min(open, close), Math.max(open, close)], 
            closePrice: close,
            isGain,
            ema9: ema9Data[i],
            ema21: ema21Data[i],
        }
    });
  }, [fullChartData]);

  const chartData = chartDataWithIndicators;
  
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

  const getPriceDomain = (data: any[]) => {
    if (data.length === 0) return [0,0];
    const highs = data.map(item => item.ohlc[1]);
    const lows = data.map(item => item.ohlc[2]);
    return [Math.min(...lows) * 0.995, Math.max(...highs) * 1.005];
  };

  const getVolumeDomain = (data: any[]) => {
    if (data.length === 0) return [0,0];
    const volumes = data.map(item => item.volume);
    return [0, Math.max(...volumes) * 2]; // Give volume bars some room
  }

  const handleBrushChange = (range: any) => {
    if (range) {
        setStartIndex(range.startIndex);
        setEndIndex(range.endIndex);
    }
  };

  const handleDoubleClick = () => {
    if (fullChartData.length > 0) {
      const newEndIndex = fullChartData.length - 1;
      const newStartIndex = Math.max(0, newEndIndex - VISIBLE_CANDLES + 1);
      setEndIndex(newEndIndex);
      setStartIndex(newStartIndex);
    }
  }

  const toggleIndicator = (name: 'ema9' | 'ema21') => {
      setVisibleIndicators(prev => ({ ...prev, [name]: !prev[name] }));
  }

  const visibleData = chartData.slice(startIndex, endIndex + 1);

  return (
    <Card className="overflow-hidden h-[420px] flex flex-col">
       <CardHeader className="flex flex-row items-center justify-between border-b p-2">
        <div className="flex items-center gap-4">
            <h3 className="text-base font-bold">NIFTY 50</h3>
            <div className="flex items-center gap-1">
                <TooltipProvider>
                    <UiTooltip>
                        <TooltipTrigger asChild>
                            <Toggle size="sm" pressed={visibleIndicators.ema9} onPressedChange={() => toggleIndicator('ema9')} className="h-7 w-7 p-1.5 data-[state=on]:bg-chart-4/20 data-[state=on]:text-chart-4">
                                <Waves />
                            </Toggle>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>EMA (9)</p>
                        </TooltipContent>
                    </UiTooltip>
                    <UiTooltip>
                        <TooltipTrigger asChild>
                            <Toggle size="sm" pressed={visibleIndicators.ema21} onPressedChange={() => toggleIndicator('ema21')} className="h-7 w-7 p-1.5 data-[state=on]:bg-chart-5/20 data-[state=on]:text-chart-5">
                                <Waves />
                            </Toggle>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>EMA (21)</p>
                        </TooltipContent>
                    </UiTooltip>
                </TooltipProvider>
            </div>
        </div>
        <span className="text-sm text-muted-foreground">5min</span>
        </CardHeader>
      <CardContent className="p-0 flex-1" onDoubleClick={handleDoubleClick}>
        <div className="h-full w-full">
            {/* Price Candlestick Chart (Top 70%) */}
            <ResponsiveContainer width="100%" height="70%">
                <ComposedChart data={visibleData} syncId="stockChart" margin={{ top: 10, right: 45, bottom: 0, left: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="time" hide />
                    <YAxis yAxisId="price" orientation="right" domain={getPriceDomain(visibleData)} tickFormatter={(value) => value.toLocaleString()} tickLine={false} axisLine={false} tickMargin={8} fontSize={10} width={60} />
                    <Tooltip content={<PriceTooltip />} position={{ y: 0 }} cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1, strokeDasharray: '3 3' }} />
                    
                    <Bar dataKey="candleWick" yAxisId="price" barSize={1} shape={<CustomWick />} isAnimationActive={false} />
                    <Bar dataKey="candleBody" yAxisId="price" barSize={CANDLE_WIDTH} shape={<CustomBody />} isAnimationActive={false} />

                    {visibleIndicators.ema9 && <Line yAxisId="price" type="monotone" dataKey="ema9" stroke="hsl(var(--chart-4))" strokeWidth={2} dot={false} isAnimationActive={false} />}
                    {visibleIndicators.ema21 && <Line yAxisId="price" type="monotone" dataKey="ema21" stroke="hsl(var(--chart-5))" strokeWidth={2} dot={false} isAnimationActive={false} />}


                    {visibleData.length > 0 && (
                        <ReferenceLine yAxisId="price" y={visibleData[visibleData.length - 1].ohlc[3]} stroke="hsl(var(--primary))" strokeDasharray="3 3" strokeWidth={1} label={{ value: ` ${visibleData[visibleData.length - 1].ohlc[3].toFixed(2)}`, position: 'right', fill: 'hsl(var(--primary))', fontSize: 10 }} />
                    )}
                </ComposedChart>
            </ResponsiveContainer>

            {/* Volume Bar Chart (Bottom 15%) */}
            <ResponsiveContainer width="100%" height="15%">
                <ComposedChart data={visibleData} syncId="stockChart" margin={{ top: 0, right: 45, bottom: 10, left: 5 }}>
                    <XAxis dataKey="time" hide />
                    <YAxis yAxisId="volume" orientation="right" domain={getVolumeDomain(visibleData)} tickFormatter={(value) => `${(Number(value) / 1000).toFixed(0)}k`} tickLine={false} axisLine={false} tickMargin={8} fontSize={10} width={60} />
                    <Tooltip content={<VolumeTooltip />} position={{y: 0}} cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1, strokeDasharray: '3 3' }} />

                    <Bar yAxisId="volume" dataKey="volume" barSize={CANDLE_WIDTH} isAnimationActive={false}>
                        {visibleData.map((entry, index) => (
                        <Cell key={`cell-volume-${index}`} fill={getVolumeColor(entry.isGain)} />
                        ))}
                    </Bar>
                </ComposedChart>
            </ResponsiveContainer>

            {/* Brush for scrolling (Bottom 15%) */}
            <ResponsiveContainer width="100%" height="15%">
                 <AreaChart 
                    data={chartData} 
                    margin={{ top: 0, right: 45, bottom: 20, left: 5 }}
                 >
                    <XAxis dataKey="time" tickLine={false} axisLine={false} tickMargin={8} fontSize={10} />
                    <YAxis domain={getPriceDomain(chartData)} hide />
                    <Tooltip content={<BrushTooltipContent />}/>
                    <Area dataKey="closePrice" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} isAnimationActive={false}/>
                    <Brush 
                        startIndex={startIndex} 
                        endIndex={endIndex} 
                        onChange={handleBrushChange} 
                        height={20} 
                        stroke="hsl(var(--muted-foreground))"
                        tickFormatter={(index) => chartData[index]?.time}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

    