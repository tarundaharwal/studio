
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
    tradingStatus,
    updatePositions,
    updateOverview,
    updateOptionChain,
    updateIndicators,
    addSignal,
    updateOrderStatus,
    setChartData,
    addCandle,
    addOrder,
    addPosition,
    closePosition,
    positions,
  } = useStore();

  const lastCandleTime = useRef(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
        const now = Date.now();
        const nowLocale = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        
        // --- MARKET DATA SIMULATION (Always runs) ---
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

            // --- TRADING LOGIC (Only runs on new candle and if trading is active) ---
            if (useStore.getState().tradingStatus === 'ACTIVE') {
                const priceAction = newCandle.ohlc[3] - lastCandleInStore.ohlc[3];
                const currentPositions = useStore.getState().positions;
                const hasOpenPosition = currentPositions.length > 0;
                
                // Simple logic: 10% chance to trade on a new candle
                if (Math.random() < 0.1) {
                    if (priceAction > 10 && !hasOpenPosition) { // If price moved up and no open position
                        // ENTER LONG
                        const newPosition = { symbol: 'NIFTY AUG FUT', qty: 50, avgPrice: newCandle.ohlc[3], ltp: newCandle.ohlc[3], pnl: 0 };
                        addPosition(newPosition);
                        addOrder({ time: nowLocale, symbol: 'NIFTY AUG FUT', type: 'BUY', qty: 50, price: newCandle.ohlc[3], status: 'EXECUTED' });
                        addSignal({ time: nowLocale, strategy: 'SIM-TREND', action: 'ENTER LONG', instrument: 'NIFTY AUG FUT', reason: 'Simulated bullish momentum.'});

                    } else if (priceAction < -10 && hasOpenPosition) { // If price moved down and has open position
                        // EXIT LONG
                        const positionToClose = currentPositions[0]; // Assuming one position for simplicity
                        addOrder({ time: nowLocale, symbol: positionToClose.symbol, type: 'SELL', qty: positionToClose.qty, price: newCandle.ohlc[3], status: 'EXECUTED' });
                        closePosition(positionToClose.symbol);
                        addSignal({ time: nowLocale, strategy: 'SIM-TREND', action: 'EXIT LONG', instrument: positionToClose.symbol, reason: 'Simulated bearish momentum.'});
                    }
                }
            }
             // --- END TRADING LOGIC ---

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

        // --- TRADING DATA SIMULATION (Only runs if trading is active) ---
        if (useStore.getState().tradingStatus === 'ACTIVE') {
            // 4. Update Positions based on new close price (LTP)
            const newPositions = useStore.getState().positions.map(pos => {
                let newLtp;
                if (pos.symbol.includes('FUT')) {
                    // Futures LTP tracks the main chart price
                    newLtp = newClosePrice;
                } else {
                    // Options have their own random volatility
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
        }
    }, TICK_INTERVAL);

    return () => {
        clearInterval(interval);
    };
  }, [timeframe, addCandle, addSignal, updateIndicators, updateOptionChain, updateOrderStatus, updateOverview, updatePositions, setChartData, addOrder, addPosition, closePosition]);

  return null;
}
