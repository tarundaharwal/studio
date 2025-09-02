
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useStore } from '@/store/use-store';
import { cn } from '@/lib/utils';
import { MachineBrainIcon } from './machine-brain-icon';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

export type BrainStatus = 'idle' | 'thinking' | 'alert' | 'profit' | 'loss' | 'focused';

const statusDescriptions: Record<BrainStatus, string> = {
    idle: "निष्क्रिय, बाजार की निगरानी कर रहा हूँ।",
    thinking: "सोच रहा हूँ... बाजार का विश्लेषण कर रहा हूँ।",
    alert: "सावधान! बाजार में उच्च अस्थिरता या चरम स्थितियाँ।",
    profit: "लाभ दर्ज कर रहा हूँ।",
    loss: "घाटे की स्थिति। जोखिम का प्रबंधन कर रहा हूँ।",
    focused: "आदेश निष्पादित कर रहा हूँ...",
};


export function MachineStatus() {
  const { signals, tradingStatus, overview, positions, indicators, optionChain, chartData } = useStore();
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  const latestSignal = signals.length > 0 ? signals[0] : null;

  // This is the core logic that connects the entire app state to the brain's status.
  const status: BrainStatus = useMemo(() => {
    if (!isClient || tradingStatus === 'STOPPED' || tradingStatus === 'EMERGENCY_STOP') {
      return 'idle';
    }
    
    if (latestSignal) {
        // focused status should be temporary after a signal
        // We parse time from the signal string e.g. "14:35:12"
        const timeParts = latestSignal.time.split(':').map(Number);
        const signalDate = new Date();
        signalDate.setHours(timeParts[0], timeParts[1], timeParts[2]);
        const signalTime = signalDate.getTime();
        const now = Date.now();
        if ((now - signalTime) < 3000 && latestSignal.strategy !== 'System' && latestSignal.strategy !== 'Risk Mgmt') {
             return 'focused';
        }
    }

    const hasOpenPosition = positions.length > 0;
    if (hasOpenPosition && positions[0]) {
        const pnlRatio = positions[0].pnl / overview.initialEquity;
        if (pnlRatio > 0.01) return 'profit'; // Profit is > 1% of initial capital
        if (pnlRatio < -0.01) return 'loss'; // Loss is > 1%
    }
    
    // Alert conditions check
    const rsi = indicators.find(i => i.name.includes('RSI'))?.value ?? 50;
    const totalPutOI = optionChain.reduce((acc, row) => acc + row.putOI, 0);
    const totalCallOI = optionChain.reduce((acc, row) => acc + row.callOI, 0);
    const pcr = totalCallOI > 0 ? totalPutOI / totalCallOI : 0;
    
    const lastCandles = chartData.slice(-3);
    let isVolatile = false;
    if (lastCandles.length >= 3) {
      const priceChange = Math.abs(lastCandles[2]?.ohlc[3] - lastCandles[0]?.ohlc[0]);
      isVolatile = priceChange > 100; // If price moved more than 100 points in last 3 candles
    }

    if (isVolatile || rsi > 75 || rsi < 25 || pcr > 1.5 || pcr < 0.7) {
        return 'alert';
    }

    // If none of the above, it's thinking
    return 'thinking';

  // We are using many state variables here to make the brain holistic
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient, tradingStatus, signals, overview.initialEquity, positions, indicators, optionChain, chartData]);


  if (!isClient) {
    return (
      <div className="flex h-[58px] w-24 animate-pulse rounded-md bg-muted"></div>
    );
  }

  const bgClass = {
    thinking: 'bg-blue-500/5',
    profit: 'bg-green-500/10',
    loss: 'bg-red-500/10',
    idle: 'bg-transparent',
    alert: 'bg-yellow-500/10',
    focused: 'bg-purple-500/10'
  }[status];

  return (
    <TooltipProvider>
        <Tooltip>
            <TooltipTrigger asChild>
                <div className={cn("flex items-center justify-center rounded-lg border p-2 w-24 h-[58px] transition-colors duration-500", bgClass)}>
                    <MachineBrainIcon status={status} />
                </div>
            </TooltipTrigger>
            <TooltipContent>
                <p>{statusDescriptions[status]}</p>
            </TooltipContent>
        </Tooltip>
    </TooltipProvider>
  );
}
