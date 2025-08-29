
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
        const lastCandleInStore = currentChartData[currentChartData.length - 1];

        // 1. Update or Create Candle
        let newClosePrice: number;

        if (now - lastCandleTime.current >= timeframeDuration) {
            // --- Create a new candle ---
            lastCandleTime.current = now;
            const newCandle = {
                time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
                ohlc: [lastCandleInStore.ohlc[3], lastCandleInStore.ohlc[3], lastCandleInStore.ohlc[3], lastCandleInStore.ohlc[3]],
                volume: 0,
            };
            addCandle(newCandle);
            newClosePrice = newCandle.ohlc[3];
        } else {
            // --- Update Current Candle ---
            const newChartData = currentChartData.slice();
            const currentCandle = { ...newChartData[newChartData.length - 1] };
            currentCandle.ohlc = [...currentCandle.ohlc]; // Crucial for re-render

            const [open, high, low, close] = currentCandle.ohlc;
            
            const volumeSpurt = Math.random() * 1000;
            const change = (Math.random() - 0.5) * (volumeSpurt / 100); 
            newClosePrice = close + change;
            
            const newHigh = Math.max(high, newClosePrice);
            const newLow = Math.min(low, newClosePrice);

            currentCandle.ohlc = [open, newHigh, newLow, newClosePrice];
            currentCandle.volume += volumeSpurt;
            
            newChartData[newChartData.length - 1] = currentCandle;
            setChartData(newChartData);
        }

        // 2. Update Positions based on new close price (LTP)
        const newPositions = positions.map(pos => {
            // For simplicity, we'll assume the chart instrument affects all positions
            const ltp = newClosePrice; 
            const newPnl = (ltp - pos.avgPrice) * pos.qty;
            return { ...pos, ltp: ltp, pnl: newPnl };
        });
        updatePositions(newPositions);

        // 3. Update Overview Cards from new positions
        const totalPnl = newPositions.reduce((acc, pos) => acc + pos.pnl, 0);
        // Make drawdown slightly dynamic
        const drawdownChange = (Math.random() - 0.5) * (totalPnl > 0 ? 10 : -50); 
        updateOverview({
            pnl: totalPnl,
            drawdown: useStore.getState().overview.drawdown + drawdownChange,
        });

        // 4. Update Option Chain based on new price
        const atmStrike = Math.round(newClosePrice / 50) * 50;
        const newOptionChain = optionChain.map(opt => {
            const isATM = opt.strike === atmStrike;
            // Simulate some activity around the current price
            const priceInfluence = (newClosePrice - opt.strike) / 100;
            return {
            ...opt,
            callLTP: Math.max(0, opt.callLTP + getRandom(-0.5, 0.5) - priceInfluence),
            putLTP: Math.max(0, opt.putLTP + getRandom(-0.5, 0.5) + priceInfluence),
            callOI: Math.max(0, opt.callOI + getRandom(isATM ? -500 : -100, isATM ? 500 : 100, 0)),
            putOI: Math.max(0, opt.putOI + getRandom(isATM ? -500 : -100, isATM ? 500 : 100, 0)),
            };
        });
        updateOptionChain(newOptionChain);

        // 5. Update Indicators based on new price
        const priceMovement = newClosePrice - lastCandleInStore.ohlc[3];
        const newIndicators = indicators.map(ind => {
            let newValue = ind.value;
            if (ind.name.includes('RSI')) {
                // Simplified RSI logic
                newValue = Math.max(0, Math.min(100, ind.value + priceMovement * 2));
            } else if (ind.name.includes('MACD')) {
                newValue = ind.value + priceMovement / 10;
            } else if (ind.name.includes('ADX')) {
                newValue = Math.max(10, ind.value + (Math.abs(priceMovement) > 1 ? 0.5 : -0.2));
            }
            return {...ind, value: newValue};
        });
        updateIndicators(newIndicators);

        // 6. Add a new signal occasionally (10% chance)
        if (Math.random() < 0.1) { 
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

        // 7. Update an order status occasionally (5% chance)
        if (Math.random() < 0.05) { 
            const pendingOrderIndex = orders.findIndex(o => o.status === 'PENDING');
            if (pendingOrderIndex !== -1) {
                updateOrderStatus(pendingOrderIndex, 'EXECUTED');
            }
        }
    }, TICK_INTERVAL);

    return () => {
        clearInterval(interval);
    };
  }, [timeframe, positions, orders, optionChain, indicators, addCandle, addSignal, updateIndicators, updateOptionChain, updateOrderStatus, updateOverview, updatePositions, setChartData]);

  return null;
}
