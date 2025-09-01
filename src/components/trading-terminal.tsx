
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
} from "recharts"
import { useStore } from "@/store/use-store"
import { Card, CardContent, CardHeader } from "./ui/card"


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

export function TradingTerminal() {
  const { chartData: fullChartData } = useStore();
  const [startIndex, setStartIndex] = React.useState(0);
  const [endIndex, setEndIndex] = React.useState(fullChartData.length - 1);
  
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
    setEndIndex(fullChartData.length > 0 ? fullChartData.length - 1 : 0);
    setStartIndex(fullChartData.length > 50 ? fullChartData.length - 50 : 0);
  }, [fullChartData.length]);
  
  const chartDataWithIndicators = React.useMemo(() => {
    if (!fullChartData || fullChartData.length === 0) return [];
    
    return fullChartData.map((d) => {
        const [open, high, low, close] = d.ohlc;
        const isGain = close >= open;

        return { 
            ...d,
            candleWick: [low, high],
            candleBody: [Math.min(open, close), Math.max(open, close)], 
            closePrice: close,
            isGain,
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

  const visibleData = chartData.slice(startIndex, endIndex + 1);

  return (
    <Card className="overflow-hidden h-[350px] flex flex-col">
       <CardHeader className="flex flex-row items-center justify-between border-b p-2">
       <div className="flex items-center gap-2">
            <h3 className="text-base font-bold">NIFTY 50</h3>
            <span className="text-sm text-muted-foreground">5min</span>
        </div>
        </CardHeader>
      <CardContent className="p-0 flex-1">
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

                    {visibleData.length > 0 && (
                        <ReferenceLine yAxisId="price" y={visibleData[visibleData.length - 1].ohlc[3]} stroke="hsl(var(--primary))" strokeDasharray="3 3" strokeWidth={1} label={{ value: ` ${visibleData[visibleData.length - 1].ohlc[3].toFixed(2)}`, position: 'right', fill: 'hsl(var(--primary))', fontSize: 10 }} />
                    )}
                </ComposedChart>
            </ResponsiveContainer>

            {/* Volume Bar Chart (Bottom 15%) */}
            <ResponsiveContainer width="100%" height="15%">
                <ComposedChart data={visibleData} syncId="stockChart" margin={{ top: 10, right: 45, bottom: 0, left: 5 }}>
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
                    margin={{ top: 10, right: 45, bottom: 20, left: 5 }}
                 >
                    <XAxis dataKey="time" tickLine={false} axisLine={false} tickMargin={8} fontSize={10} />
                    <YAxis domain={getPriceDomain(chartData)} hide />
                    <Tooltip content={<BrushTooltipContent />}/>
                    <Area dataKey="closePrice" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} isAnimationActive={false}/>
                    <Brush 
                        startIndex={startIndex} 
                        endIndex={endIndex} 
                        onChange={handleBrushChange} 
                        height={25} 
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
