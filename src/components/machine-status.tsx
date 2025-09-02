
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useStore } from '@/store/use-store';
import { cn } from '@/lib/utils';
import { MachineBrainIcon } from './machine-brain-icon';

export type BrainStatus = 'idle' | 'thinking' | 'alert' | 'profit' | 'loss' | 'focused';


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

    const hasOpenPosition = positions.length > 0;
    const currentPnl = hasOpenPosition ? positions[0].pnl : 0;
    const rsi = indicators.find(i => i.name.includes('RSI'))?.value ?? 50;
    const totalPutOI = optionChain.reduce((acc, row) => acc + row.putOI, 0);
    const totalCallOI = optionChain.reduce((acc, row) => acc + row.callOI, 0);
    const pcr = totalPutOI > 0 ? totalPutOI / totalCallOI : 0;

    // Check for a recent order signal first (within 3 seconds)
    if (latestSignal && (Date.now() - new Date(latestSignal.time).getTime()) < 3000) {
        if (latestSignal.strategy !== 'System' && latestSignal.strategy !== 'Risk Mgmt') {
            return 'focused';
        }
    }
    
    // Logic for profit and loss takes precedence if there is an open position
    if (hasOpenPosition) {
        if (currentPnl > overview.initialEquity * 0.01) return 'profit'; // Profit is > 1% of initial capital
        if (currentPnl < -overview.initialEquity * 0.01) return 'loss'; // Loss is > 1%
    }
    
    // Logic for market conditions
    const lastCandles = chartData.slice(-3);
    if (lastCandles.length >= 3) {
      const priceChange = Math.abs(lastCandles[2]?.ohlc[3] - lastCandles[0]?.ohlc[0]);
      const isVolatile = priceChange > 100; // If price moved more than 100 points in last 3 candles

      if (isVolatile || rsi > 75 || rsi < 25 || pcr > 1.5 || pcr < 0.7) {
          return 'alert';
      }
    }


    // If none of the above, it's thinking
    return 'thinking';

  }, [isClient, tradingStatus, signals, overview, positions, indicators, optionChain, chartData]);


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
    <div className={cn("flex items-center justify-center rounded-lg border p-2 w-24 h-[58px] transition-colors duration-500", bgClass)}>
      <MachineBrainIcon status={status} />
    </div>
  );
}
