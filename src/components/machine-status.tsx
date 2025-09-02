
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useStore } from '@/store/use-store';
import { cn } from '@/lib/utils';
import { MachineBrainIcon } from './machine-brain-icon';


export function MachineStatus() {
  const { signals } = useStore();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const latestSignal = signals.length > 0 ? signals[0] : null;

  const status = useMemo(() => {
    if (!latestSignal) {
      return { text: 'Analyzing...', type: 'thinking' as const };
    }

    const action = latestSignal.action.toUpperCase();

    if (action.includes('BUY')) {
      return { text: 'BUY Order Executed', type: 'buy' as const };
    }
    if (action.includes('PROFIT')) {
        return { text: 'Profit Booked', type: 'profit' as const };
    }
    if (action.includes('LOSS')) {
        return { text: 'Loss Booked', type: 'loss'as const };
    }
    if (action.includes('EMERGENCY')) {
        return { text: 'EMERGENCY STOP', type: 'loss' as const };
    }
    if (action.includes('STOP-LOSS')) {
        return { text: 'Stop-Loss Hit', type: 'loss' as const };
    }
    if (action.includes('SELL')) {
      return { text: 'SELL Order Executed', type: 'sell' as const };
    }
    
    // Default/thinking state
    return { text: 'Analyzing...', type: 'thinking' as const };

  }, [latestSignal]);


  if (!isClient) {
    return (
      <div className="flex h-12 w-48 animate-pulse rounded-md bg-muted"></div>
    );
  }

  const bgClass = {
    thinking: 'bg-blue-500/10',
    buy: 'bg-green-500/10',
    sell: 'bg-red-500/10',
    profit: 'bg-teal-400/10',
    loss: 'bg-red-500/10'
  }[status.type];

  return (
    <div className={cn("flex items-center gap-3 rounded-lg border p-2 min-w-fit flex-1", bgClass)}>
      <MachineBrainIcon status={status.type} />
      <div className="flex flex-col">
        <p className="text-xs font-bold text-foreground">{status.text}</p>
        <p className="text-[10px] text-muted-foreground">IndMon Brain</p>
      </div>
    </div>
  );
}
