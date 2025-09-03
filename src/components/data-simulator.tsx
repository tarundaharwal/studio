
'use client';

import { useEffect, useRef } from 'react';
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
  lastTickTime: state.lastTickTime,
  tickCounter: state.tickCounter,
  credentials: authState.credentials, // Pass the credentials from the auth store
});


export function DataSimulator() {
  const store = useStore();
  const authStore = useAuthStore(); // Get the whole auth store
  const { toast } = useToast();
  const isRunning = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const tick = async () => {
    // Do not run the simulation if we are not connected to the broker
    if (!authStore.session) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
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
        const errorText = await response.text();
        console.error("API Error Response:", errorText);
        throw new Error(`API call failed with status: ${response.status}`);
      }

      const newState = await response.json();

      // Update the store with the new state from the backend
      store.setChartData(newState.chartData);
      store.updatePositions(newState.positions);
      store.updateOverview(newState.overview);
      store.updateIndicators(newState.indicators);
      store.updateOptionChain(newState.optionChain);
      store.setLastTickTime(newState.lastTickTime);
      store.setTradingStatus(newState.tradingStatus);
      store.setTickCounter(newState.tickCounter); // Update the tick counter from the response

      if (newState.newOrders && newState.newOrders.length > 0) {
        newState.newOrders.forEach((order: any) => store.addOrder(order));
      }
      if (newState.newSignals && newState.newSignals.length > 0) {
        newState.newSignals.forEach((signal: any) => store.addSignal(signal));
      }

    } catch (error) {
      console.error("Error during simulation tick:", error);
      toast({
        title: "Simulation Error",
        description: "Could not connect to the simulation backend.",
        variant: "destructive",
      });
      // Stop the simulation if there's an error
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      return; 
    } finally {
      isRunning.current = false;
      timeoutRef.current = setTimeout(tick, TICK_INTERVAL);
    }
  };

  useEffect(() => {
    // Initial delay before the first tick
    timeoutRef.current = setTimeout(tick, TICK_INTERVAL);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authStore.session]); // Re-run effect if session changes (e.g., user connects/disconnects)

  return null;
}

    