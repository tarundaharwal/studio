
'use client';

import { useEffect, useRef } from 'react';
import { useStore, StoreState } from '@/store/use-store';
import { useToast } from '@/hooks/use-toast';

const TICK_INTERVAL = 2000; // 2 seconds

// Helper function to pick only the required state for the API call
const pickStateForAPI = (state: StoreState) => ({
  chartData: state.chartData,
  timeframe: state.timeframe,
  positions: state.positions,
  overview: state.overview,
  indicators: state.indicators,
  optionChain: state.optionChain,
  tradingStatus: state.tradingStatus,
  lastTickTime: state.lastTickTime, // Pass the last tick time
});


export function DataSimulator() {
  const store = useStore();
  const { toast } = useToast();
  const isRunning = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const tick = async () => {
    if (isRunning.current) {
      // If a request is already in flight, skip this tick.
      return;
    }

    try {
      isRunning.current = true;
      const currentState = pickStateForAPI(useStore.getState());
      
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
        throw new Error(`API call failed with status: ${response.status}`);
      }

      const newState = await response.json();

      // Update the store with the new state from the backend
      store.setChartData(newState.chartData);
      store.updatePositions(newState.positions);
      store.updateOverview(newState.overview);
      store.updateIndicators(newState.indicators);
      store.updateOptionChain(newState.optionChain);
      store.setLastTickTime(newState.lastTickTime); // Update the last tick time from the server response
      store.setTradingStatus(newState.tradingStatus);
      
      // We don't directly set orders and signals, as they are append-only.
      // The simulation flow returns the *new* orders/signals for this tick.
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
       // Stop the loop on error
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      return; 
    } finally {
      isRunning.current = false;
       // Schedule the next tick
      timeoutRef.current = setTimeout(tick, TICK_INTERVAL);
    }
  };

  useEffect(() => {
    // Start the simulation loop
    timeoutRef.current = setTimeout(tick, TICK_INTERVAL);

    // Cleanup function to stop the loop when the component unmounts
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array ensures this runs only once on mount

  return null; // This component does not render anything
}
