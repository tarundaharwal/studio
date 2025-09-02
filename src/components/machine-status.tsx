
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useStore } from '@/store/use-store';
import { cn } from '@/lib/utils';
import { MachineBrainIcon } from './machine-brain-icon';


export function MachineStatus() {
  const { signals, tradingStatus } = useStore();
  const [isClient, setIsClient] = useState(false);
  const [lastActionTime, setLastActionTime] = useState(0);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const latestSignal = signals.length > 0 ? signals[0] : null;

  useEffect(() => {
    if (latestSignal) {
        // Any signal that isn't a system or risk management signal is a primary action
        if (latestSignal.strategy !== 'System' && latestSignal.strategy !== 'Risk Mgmt') {
             setLastActionTime(Date.now());
        }
    }
  }, [latestSignal]);


  const status = useMemo(() => {
    if (!latestSignal) {
      return 'idle' as const;
    }
    
    // If trading is stopped, it should be idle
    if (tradingStatus === 'STOPPED') {
        return 'idle' as const;
    }

    const action = latestSignal.action.toUpperCase();

    // Show action status for 3 seconds, then revert to thinking.
    const isRecentAction = (Date.now() - lastActionTime) < 3000;
    
    if (isRecentAction) {
        if (action.includes('BUY')) {
            return 'buy' as const;
        }
        if (action.includes('PROFIT')) {
            return 'profit' as const;
        }
        if (action.includes('LOSS')) {
            return 'loss' as const;
        }
        if (action.includes('EMERGENCY')) {
            return 'loss' as const;
        }
        if (action.includes('STOP-LOSS')) {
            return 'loss' as const;
        }
        if (action.includes('SELL')) {
            return 'sell' as const;
        }
    }
    
    // Default/thinking state while active
    if (tradingStatus === 'ACTIVE') {
        return 'thinking' as const;
    }

    // Fallback to idle
    return 'idle' as const;

  }, [latestSignal, tradingStatus, lastActionTime]);


  if (!isClient) {
    return (
      <div className="flex h-[58px] w-24 animate-pulse rounded-md bg-muted"></div>
    );
  }

  const bgClass = {
    thinking: 'bg-blue-500/5',
    buy: 'bg-green-500/10',
    sell: 'bg-red-500/10',
    profit: 'bg-green-500/10',
    loss: 'bg-red-500/10',
    idle: 'bg-transparent',
  }[status];

  return (
    <div className={cn("flex items-center justify-center rounded-lg border p-2 w-24 h-[58px] transition-colors duration-500", bgClass)}>
      <MachineBrainIcon status={status} />
    </div>
  );
}
