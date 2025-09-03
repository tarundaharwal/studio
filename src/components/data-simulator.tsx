
'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useStore, StoreState } from '@/store/use-store';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/use-auth-store';

const TICK_INTERVAL = 2000; // 2 seconds

// Helper function to pick only the required state for the API call
const pickStateForAPI = (state: StoreState, authState: any) => ({
  chartData: state.chartData,
  timeframe: state.timeframe,
  positions: state.positions,
  overview: state.overview,
  indicators: state.indicators,
  optionChain: state.optionChain,
  tradingStatus: state.tradingStatus,
  tickCounter: state.tickCounter,
  session: authState.session, // Pass the entire session object
});


export function DataSimulator() {
  const store = useStore();
  const authStore = useAuthStore();
  const { toast } = useToast();
  const isRunning = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const tick = useCallback(async () => {
    // CRITICAL CHECK: Do not run the simulation if we are not connected.
    const currentSession = useAuthStore.getState().session;
    if (!currentSession) {
      // If not connected, simply wait and check again. Don't run the simulation.
      timeoutRef.current = setTimeout(tick, TICK_INTERVAL);
      return;
    }
      
    if (isRunning.current) {
      return;
    }

    try {
      isRunning.current = true;
      const currentState = pickStateForAPI(useStore.getState(), useAuthStore.getState());
      
      const response = await fetch('/api/simulate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(currentState),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error Response:", errorData);
        
        // If the error indicates an auth failure, clear the session
        if (response.status === 401) {
            authStore.clearAuth();
            toast({
                title: "Broker Connection Lost",
                description: errorData.message || "Your session expired or became invalid. Please reconnect.",
                variant: "destructive",
            });
        } else {
            toast({
                title: "Simulation Error",
                description: errorData.message || `API call failed with status: ${response.status}`,
                variant: "destructive",
            });
        }
        
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        isRunning.current = false;
        // Schedule the next check, which will fail until reconnected.
        timeoutRef.current = setTimeout(tick, TICK_INTERVAL);
        return;
      }

      const newState = await response.json();

      // Update the store with the new state from the backend
      store.setChartData(newState.chartData);
      store.updatePositions(newState.positions);
      store.updateOverview(newState.overview);
      store.updateIndicators(newState.indicators);
      store.updateOptionChain(newState.updateOptionChain); // Corrected from updateOptionChain
      store.setLastTickTime(newState.lastTickTime);
      store.setTradingStatus(newState.tradingStatus);
      store.setTickCounter(newState.tickCounter);

      if (newState.newOrders && newState.newOrders.length > 0) {
        newState.newOrders.forEach((order: any) => store.addOrder(order));
      }
      if (newState.newSignals && newState.newSignals.length > 0) {
        newState.newSignals.forEach((signal: any) => store.addSignal(signal));
      }

    } catch (error) {
      console.error("Error during simulation tick:", error);
      if (useAuthStore.getState().session) {
        toast({
            title: "Network Error",
            description: "Could not connect to the simulation backend.",
            variant: "destructive",
        });
      }
    } finally {
      isRunning.current = false;
      // Always reschedule the next tick. The check at the top will handle pausing.
      timeoutRef.current = setTimeout(tick, TICK_INTERVAL);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store, authStore, toast]);


  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(tick, TICK_INTERVAL);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [tick]);

  return null;
}
