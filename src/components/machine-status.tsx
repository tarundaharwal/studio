
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { BrainCircuit } from 'lucide-react';
import { useStore } from '@/store/use-store';
import { cn } from '@/lib/utils';

export function MachineStatus() {
  const { signals } = useStore();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const latestSignal = signals.length > 0 ? signals[0] : null;

  const status = useMemo(() => {
    if (!latestSignal) {
      return { text: 'Analyzing...', iconClass: 'text-blue-500 animate-pulse', bgClass: 'bg-blue-500/10' };
    }

    const action = latestSignal.action.toUpperCase();

    if (action.includes('BUY')) {
      return { text: 'BUY Order Executed', iconClass: 'text-green-500', bgClass: 'bg-green-500/10' };
    }
    if (action.includes('PROFIT')) {
        return { text: 'Profit Booked', iconClass: 'text-teal-400', bgClass: 'bg-teal-400/10' };
    }
    if (action.includes('LOSS')) {
        return { text: 'Loss Booked', iconClass: 'text-red-500', bgClass: 'bg-red-500/10' };
    }
    if (action.includes('EMERGENCY')) {
        return { text: 'EMERGENCY STOP', iconClass: 'text-amber-500 animate-ping', bgClass: 'bg-amber-500/10' };
    }
    if (action.includes('SELL')) {
      return { text: 'SELL Order Executed', iconClass: 'text-red-500', bgClass: 'bg-red-500/10' };
    }
    
    // Default/thinking state
    return { text: 'Analyzing...', iconClass: 'text-blue-500 animate-pulse', bgClass: 'bg-blue-500/10' };

  }, [latestSignal]);

  // A key is used on the icon to force a re-render and restart animation on state change
  const animationKey = latestSignal ? latestSignal.time : 'initial';

  if (!isClient) {
    return (
      <div className="flex h-12 w-48 animate-pulse rounded-md bg-muted"></div>
    );
  }

  return (
    <div className={cn("flex items-center gap-3 rounded-lg border p-2 min-w-fit flex-1", status.bgClass)}>
      <BrainCircuit key={animationKey} className={cn("h-5 w-5 transition-colors duration-300", status.iconClass)} />
      <div className="flex flex-col">
        <p className="text-xs font-bold text-foreground">{status.text}</p>
        <p className="text-[10px] text-muted-foreground">IndMon Brain</p>
      </div>
    </div>
  );
}
