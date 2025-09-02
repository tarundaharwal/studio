
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
      return { type: 'thinking' as const };
    }

    const action = latestSignal.action.toUpperCase();

    if (action.includes('BUY')) {
      return { type: 'buy' as const };
    }
    if (action.includes('PROFIT')) {
        return { type: 'profit' as const };
    }
    if (action.includes('LOSS')) {
        return { type: 'loss'as const };
    }
    if (action.includes('EMERGENCY')) {
        return { type: 'loss' as const };
    }
    if (action.includes('STOP-LOSS')) {
        return { type: 'loss' as const };
    }
    if (action.includes('SELL')) {
      return { type: 'sell' as const };
    }
    
    // Default/thinking state
    return { type: 'thinking' as const };

  }, [latestSignal]);


  if (!isClient) {
    return (
      <div className="flex h-[58px] w-24 animate-pulse rounded-md bg-muted"></div>
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
    <div className={cn("flex items-center justify-center rounded-lg border p-2 w-24 h-[58px]", bgClass)}>
      <MachineBrainIcon status={status.type} />
    </div>
  );
}
