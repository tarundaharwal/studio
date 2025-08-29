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
    tradingStatus,
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
        
        // MARKET DATA SIMULATION (Always runs)
        // This block simulates the market itself, which never stops.
        
        const timeframeDuration = timeframes[timeframe] || timeframes['5m'];
        const currentChartData = useStore.getState().chartData;
        const newChartData = currentChartData.slice(); // Create a shallow copy for mutation
        const lastCandleInStore = newChartData[newChartData.length - 1];
        let newClosePrice: number;

        // 1. Update or Create Candle
        if (now - lastCandleTime.current >= timeframeDuration) {
            lastCandleTime.current = now;
            const lastClose = lastCandleInStore.ohlc[3];
            const newCandle = {
                time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
                ohlc: [lastClose, lastClose, lastClose, lastClose], // Start new candle from last close
                volume: 0,
            };
            addCandle(newCandle);
            newClosePrice = newCandle.ohlc[3];
        } else {
            const currentCandle = { ...newChartData[newChartData.length - 1] };
            currentCandle.ohlc = [...currentCandle.ohlc]; // IMPORTANT: Create a copy of ohlc array

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

        // 2. Update Option Chain based on new market price
        const atmStrike = Math.round(newClosePrice / 50) * 50;
        const newOptionChain = useStore.getState().optionChain.map(opt => {
            const isATM = opt.strike === atmStrike;
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

        // 3. Update Indicators based on new market price
        const priceMovement = newClosePrice - (newChartData[newChartData.length - 2]?.ohlc[3] || newClosePrice);
        const newIndicators = useStore.getState().indicators.map(ind => {
            let newValue = ind.value;
            if (ind.name.includes('RSI')) {
                newValue = Math.max(0, Math.min(100, ind.value + priceMovement * 2));
            } else if (ind.name.includes('MACD')) {
                newValue = ind.value + priceMovement / 10;
            } else if (ind.name.includes('ADX')) {
                newValue = Math.max(10, ind.value + (Math.abs(priceMovement) > 1 ? 0.5 : -0.2));
            }
            return {...ind, value: newValue};
        });
        updateIndicators(newIndicators);

        // TRADING SIMULATION (Only runs if trading is active)
        // This block simulates the user's portfolio and trading actions.
        if (useStore.getState().tradingStatus === 'ACTIVE') {
            // 4. Update Positions based on new close price (LTP)
            const newPositions = useStore.getState().positions.map(pos => {
                let newLtp;
                if (pos.symbol.includes('FUT')) {
                    newLtp = newClosePrice;
                } else {
                    const optionChange = getRandom(-2.5, 2.5);
                    newLtp = Math.max(0.05, pos.ltp + optionChange);
                }
                const newPnl = (newLtp - pos.avgPrice) * pos.qty;
                return { ...pos, ltp: newLtp, pnl: newPnl };
            });
            updatePositions(newPositions);

            // 5. Update Overview Cards from new positions
            const totalPnl = newPositions.reduce((acc, pos) => acc + pos.pnl, 0);
            const drawdownChange = (Math.random() - 0.5) * (totalPnl > 0 ? 10 : -50); 
            updateOverview({
                pnl: totalPnl,
                drawdown: useStore.getState().overview.drawdown + drawdownChange,
            });

            // 6. Add a new signal occasionally (2% chance)
            if (Math.random() < 0.02) { 
                const actions = ['ENTER LONG', 'EXIT LONG', 'MONITOR', 'CONFIRM'];
                const instruments = ['NIFTY AUG FUT', 'NIFTY 29 AUG 22800 CE'];
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
                const currentOrders = useStore.getState().orders;
                const pendingOrderIndex = currentOrders.findIndex(o => o.status === 'PENDING');
                if (pendingOrderIndex !== -1) {
                    updateOrderStatus(pendingOrderIndex, 'EXECUTED');
                }
            }
        }
    }, TICK_INTERVAL);

    return () => {
        clearInterval(interval);
    };
  }, [timeframe, addCandle, addSignal, updateIndicators, updateOptionChain, updateOrderStatus, updateOverview, updatePositions, setChartData]);

  return null;
}