
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
  const { signals, tradingStatus, overview, positions, indicators, chartData } = useStore();
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  const latestSignal = signals.length > 0 ? signals[0] : null;

  // This is the core logic that connects the entire app state to the brain's status.
  // The order of these checks is CRITICAL. We check for the most specific and high-priority states first.
  const status: BrainStatus = useMemo(() => {
    if (!isClient) {
      return 'idle';
    }
    
    // 1. IDLE: Highest priority. If trading is off, nothing else matters.
    if (tradingStatus === 'STOPPED' || tradingStatus === 'EMERGENCY_STOP') {
      return 'idle';
    }
    
    // 2. FOCUSED: An action was just taken. This overrides everything for a few seconds.
    if (latestSignal) {
        const now = new Date();
        const signalTimeParts = latestSignal.time.split(':').map(Number);
        // Correctly create a Date object for today with the signal's time
        const signalDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), signalTimeParts[0], signalTimeParts[1], signalTimeParts[2] || 0);

        const isRecent = (now.getTime() - signalDate.getTime()) < 3000; // 3 seconds
        const isAction = latestSignal.action.includes('BUY') || latestSignal.action.includes('SELL');

        if (isRecent && isAction) {
             return 'focused';
        }
    }

    // 3. PROFIT / LOSS: The state of an open position is very important.
    const hasOpenPosition = positions.length > 0;
    if (hasOpenPosition) {
        const currentPosition = positions[0];
        // Check for significant P&L. Using absolute P&L instead of ratio for simplicity.
        if (currentPosition.pnl > 5000) return 'profit'; // Profit is > 5k
        if (currentPosition.pnl < -5000) return 'loss'; // Loss is > 5k
    }
    
    // 4. ALERT: If no major P&L event or action, check for dangerous market conditions.
    const rsi = indicators.find(i => i.name.includes('RSI'))?.value ?? 50;
    
    const lastCandles = chartData.slice(-3);
    let isVolatile = false;
    if (lastCandles.length >= 2) {
      const priceChange = Math.abs(lastCandles[1].ohlc[3] - lastCandles[0].ohlc[3]);
      isVolatile = priceChange > 100; // If price moved more than 100 points in last candle
    }

    if (isVolatile || rsi > 75 || rsi < 25) {
        return 'alert';
    }

    // 5. THINKING: If none of the above, the machine is in its default analysis state.
    return 'thinking';

  // We are using many state variables here to make the brain holistic
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient, tradingStatus, signals, overview.initialEquity, positions, indicators, chartData]);


  if (!isClient) {
    return (
      <div className="flex h-[58px] w-[58px] animate-pulse rounded-md bg-muted"></div>
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
                <div className={cn("flex items-center justify-center rounded-lg border p-1 w-[58px] h-[58px] transition-colors duration-500", bgClass)}>
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
