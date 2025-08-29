
'use client';

import { useEffect } from 'react';
import { useStore } from '@/store/use-store';

// Helper to generate a random number within a range
const getRandom = (min: number, max: number, precision: number = 2) => {
    return parseFloat((Math.random() * (max - min) + min).toFixed(precision));
};

export function DataSimulator() {
  const {
    chartData,
    positions,
    orders,
    optionChain,
    indicators,
    signals,
    updateChart,
    updatePositions,
    updateOverview,
    updateOptionChain,
    updateIndicators,
    addSignal,
    updateOrderStatus,
  } = useStore();

  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Update Chart Data (current candle)
      const currentCandle = { ...chartData[chartData.length - 1] };
      const [open, high, low, close] = currentCandle.ohlc;
      
      // Simulate price change
      const change = (Math.random() - 0.5) * 10;
      let newClose = close + change;
      
      // Update H, L, C. Keep O the same.
      const newHigh = Math.max(high, newClose);
      const newLow = Math.min(low, newClose);
      currentCandle.ohlc = [open, newHigh, newLow, newClose];
      
      const newVolume = currentCandle.volume + (Math.random() * 10000);
      currentCandle.volume = Math.max(0, newVolume);
      
      updateChart(currentCandle);


      // 2. Update Positions
      const newPositions = positions.map(pos => {
        const ltpChange = (Math.random() - 0.5) * 2;
        const newLtp = pos.ltp + ltpChange;
        const newPnl = (newLtp - pos.avgPrice) * pos.qty;
        return { ...pos, ltp: newLtp, pnl: newPnl };
      });
      updatePositions(newPositions);

      // 3. Update Overview Cards
      const totalPnl = newPositions.reduce((acc, pos) => acc + pos.pnl, 0);
      const drawdownChange = (Math.random() - 0.5) * 100;
      updateOverview({
        pnl: totalPnl,
        drawdown: useStore.getState().overview.drawdown + drawdownChange,
      });

       // 4. Update Option Chain
       const newOptionChain = optionChain.map(opt => ({
        ...opt,
        callLTP: Math.max(0, opt.callLTP + getRandom(-5, 5)),
        putLTP: Math.max(0, opt.putLTP + getRandom(-5, 5)),
        callOI: Math.max(0, opt.callOI + getRandom(-1000, 1000, 0)),
        putOI: Math.max(0, opt.putOI + getRandom(-1000, 1000, 0)),
      }));
      updateOptionChain(newOptionChain);

      // 5. Update Indicators
      const newIndicators = indicators.map(ind => {
        let newValue = ind.value + getRandom(-2, 2);
        if (ind.name.includes('RSI')) {
            newValue = Math.max(0, Math.min(100, newValue));
        }
        return {...ind, value: newValue};
      });
      updateIndicators(newIndicators);

      // 6. Add a new signal occasionally
      if (Math.random() < 0.1) { // 10% chance to add a signal
        const actions = ['ENTER LONG', 'EXIT LONG', 'MONITOR', 'CONFIRM'];
        const instruments = ['NIFTYBEES', 'BANKBEES'];
        addSignal({
            time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            strategy: 'RSI-MR',
            action: actions[Math.floor(Math.random() * actions.length)],
            instrument: instruments[Math.floor(Math.random() * instruments.length)],
            reason: 'Simulated signal event.'
        });
      }

      // 7. Update an order status occasionally
      if (Math.random() < 0.05) { // 5% chance
        const pendingOrderIndex = orders.findIndex(o => o.status === 'PENDING');
        if (pendingOrderIndex !== -1) {
            updateOrderStatus(pendingOrderIndex, 'EXECUTED');
        }
      }

    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, [addSignal, chartData, indicators, optionChain, orders, positions, updateChart, updateIndicators, updateOptionChain, updateOrderStatus, updateOverview, updatePositions]); // Empty dependency array ensures this runs only once on mount

  return null; // This component does not render anything
}
