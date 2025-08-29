
'use server';
/**
 * @fileOverview The backend simulation engine for the IndMon trading dashboard.
 * This flow acts as the "brain" of the simulator, taking the current state of the market
 * and portfolio, and returning the state after one tick of activity.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// Define schemas for the data structures we'll be working with.
// This ensures type safety and clear contracts.
const ChartDataSchema = z.object({
  time: z.string(),
  ohlc: z.tuple([z.number(), z.number(), z.number(), z.number()]),
  volume: z.number(),
});

const PositionSchema = z.object({
  symbol: z.string(),
  qty: z.number(),
  avgPrice: z.number(),
  ltp: z.number(),
  pnl: z.number(),
});

const OrderSchema = z.object({
    time: z.string(),
    symbol: z.string(),
    type: z.enum(['BUY', 'SELL']),
    qty: z.number(),
    price: z.number(),
    status: z.enum(['EXECUTED', 'PENDING', 'CANCELLED']),
});

const OverviewSchema = z.object({
  equity: z.number(),
  initialEquity: z.number(),
  pnl: z.number(),
  maxDrawdown: z.number(),
  peakEquity: z.number(),
});

const IndicatorSchema = z.object({
  name: z.string(),
  value: z.number(),
});

const OptionSchema = z.object({
    strike: z.number(),
    callOI: z.number(),
    callIV: z.number(),
    callLTP: z.number(),
    putLTP: z.number(),
    putIV: z.number(),
    putOI: z.number(),
});

const SignalSchema = z.object({
    time: z.string(),
    strategy: z.string(),
    action: z.string(),
    instrument: z.string(),
    reason: z.string(),
});

// Define the input schema for our main flow. This is the entire state
// of the frontend store that we need for the simulation.
const SimulationInputSchema = z.object({
  chartData: z.array(ChartDataSchema),
  timeframe: z.string(),
  positions: z.array(PositionSchema),
  orders: z.array(OrderSchema),
  overview: OverviewSchema,
  indicators: z.array(IndicatorSchema),
  optionChain: z.array(OptionSchema),
  tradingStatus: z.enum(['ACTIVE', 'STOPPED']),
});
export type SimulationInput = z.infer<typeof SimulationInputSchema>;


// Define the output schema. It includes the updated state and also
// any *new* orders or signals generated during this tick.
const SimulationOutputSchema = SimulationInputSchema.extend({
    newOrders: z.array(OrderSchema),
    newSignals: z.array(SignalSchema),
});


// Helper to generate a random number within a range
const getRandom = (min: number, max: number, precision: number = 2) => {
  return parseFloat((Math.random() * (max - min) + min).toFixed(precision));
};

const timeframes: { [key: string]: number } = {
    '1m': 1 * 60 * 1000,
    '5m': 5 * 60 * 1000,
    '15m': 15 * 60 * 1000,
    '1h': 60 * 60 * 1000,
};

// This is the main simulation flow, defined with Genkit
export const simulationFlow = ai.defineFlow(
  {
    name: 'simulationFlow',
    inputSchema: SimulationInputSchema,
    outputSchema: SimulationOutputSchema,
  },
  async (input) => {
    // Destructure the input to get the current state
    let { chartData, timeframe, positions, orders, overview, indicators, optionChain, tradingStatus } = input;
    
    // These arrays will hold any new events generated during this tick
    const newOrders: z.infer<typeof OrderSchema>[] = [];
    const newSignals: z.infer<typeof SignalSchema>[] = [];

    // --- MARKET DATA SIMULATION ---
    let newClosePrice: number;
    const now = Date.now();
    const nowLocale = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    // We need to mutate the data, so we create deep copies
    let newChartData = JSON.parse(JSON.stringify(chartData));
    let lastCandleInStore = newChartData[newChartData.length - 1];

    // Simulate a new candle if timeframe has passed
    // NOTE: This logic is simplified and assumes regular tick intervals.
    // A more robust solution would use actual timestamps.
    const lastCandleTime = new Date(`1970-01-01T${lastCandleInStore.time}Z`).getTime();
    const timeframeDuration = timeframes[timeframe] || timeframes['5m'];

    if (now - lastCandleTime > timeframeDuration * 20) { // simplified check for new candle
        const lastClose = lastCandleInStore.ohlc[3];
        const newCandle = {
            time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
            ohlc: [lastClose, lastClose, lastClose, lastClose],
            volume: 0,
        };
        newChartData = [...newChartData.slice(1), newCandle];
        newClosePrice = newCandle.ohlc[3];

        // --- TRADING LOGIC (Only on new candle & if trading is active) ---
        if (tradingStatus === 'ACTIVE') {
            const priceAction = newCandle.ohlc[3] - newChartData[newChartData.length - 2].ohlc[3];
            const hasOpenPosition = positions.length > 0;
            
            if (Math.random() < 0.1) { // 10% chance to trade
                if (priceAction > 10 && !hasOpenPosition) {
                    const newPosition = { symbol: 'NIFTY AUG FUT', qty: 50, avgPrice: newCandle.ohlc[3], ltp: newCandle.ohlc[3], pnl: 0 };
                    positions = [...positions, newPosition];
                    newOrders.push({ time: nowLocale, symbol: 'NIFTY AUG FUT', type: 'BUY', qty: 50, price: newCandle.ohlc[3], status: 'EXECUTED' });
                    newSignals.push({ time: nowLocale, strategy: 'SIM-TREND', action: 'ENTER LONG', instrument: 'NIFTY AUG FUT', reason: 'Simulated bullish momentum.'});
                } else if (priceAction < -10 && hasOpenPosition) {
                    const positionToClose = positions[0];
                    newOrders.push({ time: nowLocale, symbol: positionToClose.symbol, type: 'SELL', qty: positionToClose.qty, price: newCandle.ohlc[3], status: 'EXECUTED' });
                    
                    const pnlFromTrade = (newCandle.ohlc[3] - positionToClose.avgPrice) * positionToClose.qty;
                    overview.equity += pnlFromTrade;
                    overview.pnl += pnlFromTrade;
                    overview.peakEquity = Math.max(overview.peakEquity, overview.equity);
                    overview.maxDrawdown = Math.max(overview.maxDrawdown, overview.peakEquity - overview.equity);

                    positions = positions.filter(p => p.symbol !== positionToClose.symbol);
                    newSignals.push({ time: nowLocale, strategy: 'SIM-TREND', action: 'EXIT LONG', instrument: positionToClose.symbol, reason: 'Simulated bearish momentum.'});
                }
            }
        }
    } else { // Update current candle
        let currentCandle = newChartData[newChartData.length - 1];
        const [open, high, low, close] = currentCandle.ohlc;
        const change = (Math.random() - 0.5) * 5;
        newClosePrice = close + change;
        currentCandle.ohlc = [open, Math.max(high, newClosePrice), Math.min(low, newClosePrice), newClosePrice];
        currentCandle.volume += Math.random() * 1000;
    }

    // --- UPDATE OTHER MARKET DATA ---
    const newOptionChain = optionChain.map(opt => ({
        ...opt,
        callLTP: Math.max(0, opt.callLTP + getRandom(-0.5, 0.5) - (newClosePrice - opt.strike) / 100),
        putLTP: Math.max(0, opt.putLTP + getRandom(-0.5, 0.5) + (newClosePrice - opt.strike) / 100),
    }));

    const priceMovement = newClosePrice - (chartData[chartData.length - 2]?.ohlc[3] || newClosePrice);
    const newIndicators = indicators.map(ind => {
        let newValue = ind.value;
        if (ind.name.includes('RSI')) newValue = Math.max(0, Math.min(100, ind.value + priceMovement * 2));
        else if (ind.name.includes('MACD')) newValue = ind.value + priceMovement / 10;
        else if (ind.name.includes('ADX')) newValue = Math.max(10, ind.value + (Math.abs(priceMovement) > 1 ? 0.5 : -0.2));
        return {...ind, value: newValue};
    });

    // --- UPDATE PORTFOLIO DATA (if trading active) ---
    if (tradingStatus === 'ACTIVE') {
        let totalUnrealizedPnl = 0;
        const newPositions = positions.map(pos => {
            const newLtp = newClosePrice; // Simplified: all positions track main instrument
            const pnl = (newLtp - pos.avgPrice) * pos.qty;
            totalUnrealizedPnl += pnl;
            return { ...pos, ltp: newLtp, pnl: pnl };
        });

        const currentPnl = overview.pnl; // Realized PNL
        const floatingEquity = overview.equity; // Realized Equity

        // In a real system, you'd calculate unrealized PNL separately.
        // Here, we just update the main PNL for simplicity of display.
        overview.pnl = currentPnl + totalUnrealizedPnl;
        overview.peakEquity = Math.max(overview.peakEquity, floatingEquity + totalUnrealizedPnl);
        overview.maxDrawdown = Math.max(overview.maxDrawdown, overview.peakEquity - (floatingEquity + totalUnrealizedPnl));
        positions = newPositions;
    }

    // Return the new state
    return {
      chartData: newChartData,
      timeframe,
      positions,
      orders, // Orders list is managed by the frontend store (append-only)
      overview,
      indicators: newIndicators,
      optionChain: newOptionChain,
      