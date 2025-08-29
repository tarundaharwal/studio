
'use client';

import { useEffect, useRef } from 'react';
import { useStore } from '@/store/use-store';

const timeframes: { [key: string]: number } = {
    '1m': 1 * 60 * 1000,
    '5m': 5 * 60 * 1000,
    '15m': 15 * 60 * 1000,
    '1h': 60 * 60 * 1000,
};
const TICK_INTERVAL = 2000; // 2 seconds

// Helper to generate a random number within a range
const getRandom = (min: number, max: number, precision: number = 2) => {
    return parseFloat((Math.random() * (max - min) + min).toFixed(precision));
};

export function DataSimulator() {
  const {
    timeframe,
    positions,
    orders,
    optionChain,
    indicators,
    signals,
    updatePositions,
    updateOverview,
    updateOptionChain,
    updateIndicators,
    addSignal,
    updateOrderStatus,
    setChartData,
    addCandle
  } = useStore();

  const lastCandleTime = useRef(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
        const now = Date.now();
        const timeframeDuration = timeframes[timeframe] || timeframes['5m'];
        const currentChartData = useStore.getState().chartData;

        // Check if it's time to create a new candle
        if (now - lastCandleTime.current >= timeframeDuration) {
            lastCandleTime.current = now;
            const lastCandle = currentChartData[currentChartData.length - 1];
            const newCandle = {
                time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
                // Open price is the previous close
                ohlc: [lastCandle.ohlc[3], lastCandle.ohlc[3], lastCandle.ohlc[3], lastCandle.ohlc[3]],
                volume: 0,
            };
            addCandle(newCandle);
        } else {
            // Update Current Candle
            const newChartData = currentChartData.slice(); // Create a copy
            const currentCandle = { ...newChartData[newChartData.length - 1] };
            
            // This is the critical fix: create a new copy of the ohlc array
            currentCandle.ohlc = [...currentCandle.ohlc];

            const [open, high, low, close] = currentCandle.ohlc;
            
            const volumeSpurt = Math.random() * 1000;
            const change = (Math.random() - 0.5) * (volumeSpurt / 100); 
            let newClose = close + change;
            
            const newHigh = Math.max(high, newClose);
            const newLow = Math.min(low, newClose);

            currentCandle.ohlc = [open, newHigh, newLow, newClose];
            currentCandle.volume += volumeSpurt;
            
            // Replace the last element in the copied array
            newChartData[newChartData.length - 1] = currentCandle;
            
            // Set the new array in the store
            setChartData(newChartData);
        }

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
    }, TICK_INTERVAL);

    return () => {
        clearInterval(interval);
    };
  }, [timeframe, addCandle, addSignal, updateIndicators, updateOptionChain, updateOrderStatus, updateOverview, updatePositions, optionChain, orders, positions, signals, indicators, setChartData]);

  return null;
}

    