
"use client"

import * as React from "react"
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card"
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
import { useStore } from "@/store/use-store"


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


const CANDLE_WIDTH = 12;

export function TradingTerminal() {
  const { chartData: fullChartData } = useStore();
  
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

  const chartData = chartDataWithIndicators;

  const livePrice = React.useMemo(() => {
    if (!chartData || chartData.length < 2) {
        return { latestPrice: 0, priceChange: 0, priceChangePercent: 0, isGain: true };
    }
    const latestPrice = chartData[chartData.length - 1].ohlc[3];
    const previousDayClose = chartData[chartData.length - 2].ohlc[3];
    const priceChange = latestPrice - previousDayClose;
    const priceChangePercent = previousDayClose !== 0 ? (priceChange / previousDayClose) * 100 : 0;
    const isGain = priceChange >= 0;

    return { latestPrice, priceChange, priceChangePercent, isGain };
  }, [chartData]);
  
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
      <CardHeader className="flex flex-row items-center justify-between border-b p-2">
       <div className="flex items-center gap-2">
            <h3 className="text-base font-bold">NIFTY 50</h3>
            <span className="text-sm text-muted-foreground">5m</span>
        </div>
        <div className={`flex items-center gap-2 text-sm text-muted-foreground transition-colors ${livePrice.isGain ? 'text-green-600' : 'text-red-600'}`}>
            <span className="font-medium">{livePrice.latestPrice.toFixed(2)}</span>
            <span className="text-xs">({livePrice.isGain ? '+' : ''}{livePrice.priceChangePercent.toFixed(2)}%)</span>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-1">
        <div className="h-full w-full">
            {/* Price Candlestick Chart (Top 75%) */}
            <ResponsiveContainer width="100%" height="75%">
                <ComposedChart data={chartData} syncId="stockChart" margin={{ top: 10, right: 45, bottom: 0, left: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="time" hide />
                    <YAxis yAxisId="price" orientation="right" domain={getPriceDomain()} tickFormatter={(value) => value.toLocaleString()} tickLine={false} axisLine={false} tickMargin={8} fontSize={10} width={60} />
                    <Tooltip content={<PriceTooltip />} cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1, strokeDasharray: '3 3' }} />
                    
                    <Bar dataKey="candleWick" yAxisId="price" barSize={1} shape={<CustomWick />} isAnimationActive={false} />
                    <Bar dataKey="candleBody" yAxisId="price" barSize={CANDLE_WIDTH} shape={<CustomBody />} isAnimationActive={false} />

                    {chartData.length > 0 && (
                        <ReferenceLine yAxisId="price" y={chartData[chartData.length - 1].ohlc[3]} stroke="hsl(var(--primary))" strokeDasharray="3 3" strokeWidth={1} label={{ value: ` ${chartData[chartData.length - 1].ohlc[3].toFixed(2)}`, position: 'right', fill: 'hsl(var(--primary))', fontSize: 10 }} />
                    )}
                </ComposedChart>
            </ResponsiveContainer>

            {/* Volume Bar Chart (Bottom 25%) */}
            <ResponsiveContainer width="100%" height="25%">
                <ComposedChart data={chartData} syncId="stockChart" margin={{ top: 10, right: 45, bottom: 20, left: 5 }}>
                    <XAxis dataKey="time" tickLine={false} axisLine={false} tickMargin={8} fontSize={10} interval="preserveStartEnd" />
                    <YAxis yAxisId="volume" orientation="right" domain={getVolumeDomain()} tickFormatter={(value) => `${(Number(value) / 1000).toFixed(0)}k`} tickLine={false} axisLine={false} tickMargin={8} fontSize={10} width={60} />
                    <Tooltip content={<VolumeTooltip />} cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1, strokeDasharray: '3 3' }} />

                    <Bar yAxisId="volume" dataKey="volume" barSize={CANDLE_WIDTH} isAnimationActive={false}>
                        {chartData.map((entry, index) => (
                        <Cell key={`cell-volume-${index}`} fill={getVolumeColor(entry.isGain)} />
                        ))}
                    </Bar>
                </ComposedChart>
            </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
