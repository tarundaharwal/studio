
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
    profit: "लाभ की स्थिति में।",
    loss: "घाटे की स्थिति। जोखिम का प्रबंधन कर रहा हूँ।",
    focused: "आदेश निष्पादित कर रहा हूँ...",
};


export function MachineStatus() {
  const { signals, tradingStatus, positions, indicators, chartData } = useStore();
  const [isClient, setIsClient] = useState(false);
  const [focusState, setFocusState] = useState<BrainStatus | null>(null);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Effect to handle the 'focused' state for 3 seconds
  useEffect(() => {
    if (signals.length === 0) return;

    const latestSignal = signals[0];
    const isAction = latestSignal.action.includes('BUY') || latestSignal.action.includes('SELL');

    if (isAction) {
        setFocusState('focused');
        const timer = setTimeout(() => {
            setFocusState(null);
        }, 3000); // Disappear after 3 seconds

        return () => clearTimeout(timer);
    }
  }, [signals]);


  // This is the core logic that connects the entire app state to the brain's status.
  // The order of these checks is CRITICAL.
  const status: BrainStatus = useMemo(() => {
    if (!isClient) {
      return 'idle';
    }
    
    // 1. IDLE: Highest priority. If trading is off, nothing else matters.
    if (tradingStatus === 'STOPPED' || tradingStatus === 'EMERGENCY_STOP') {
      return 'idle';
    }

    // 2. FOCUSED: An action was just taken. This overrides everything for a few seconds.
    if (focusState === 'focused') {
        return 'focused';
    }
    
    // 3. PROFIT / LOSS: The state of an open position is very important.
    const hasOpenPosition = positions.length > 0;
    if (hasOpenPosition) {
        const currentPosition = positions[0];
        // Use a small threshold to avoid flickering
        if (currentPosition.pnl > 0) return 'profit';
        if (currentPosition.pnl < 0) return 'loss';
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

  }, [isClient, tradingStatus, signals, positions, indicators, chartData, focusState]);


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
