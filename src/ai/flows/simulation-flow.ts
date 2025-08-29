
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
export type ChartData = z.infer<typeof ChartDataSchema>;

const PositionSchema = z.object({
  symbol: z.string(),
  qty: z.number(),
  avgPrice: z.number(),
  ltp: z.number(),
  pnl: z.number(),
});
export type Position = z.infer<typeof PositionSchema>;

const OrderSchema = z.object({
    time: z.string(),
    symbol: z.string(),
    type: z.enum(['BUY', 'SELL']),
    qty: z.number(),
    price: z.number(),
    status: z.enum(['EXECUTED', 'PENDING', 'CANCELLED']),
});
export type Order = z.infer<typeof OrderSchema>;

const OverviewSchema = z.object({
  equity: z.number(),
  initialEquity: z.number(),
  pnl: z.number(),
  maxDrawdown: z.number(),
  peakEquity: z.number(),
});
export type Overview = z.infer<typeof OverviewSchema>;

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
export type Signal = z.infer<typeof SignalSchema>;


// Define the input schema for our main flow. This is the entire state
// of the frontend store that we need for the simulation.
const SimulationInputSchema = z.object({
  chartData: z.array(ChartDataSchema),
  timeframe: z.string(),
  positions: z.array(PositionSchema),
  overview: OverviewSchema,
  indicators: z.array(IndicatorSchema),
  optionChain: z.array(OptionSchema),
  tradingStatus: z.enum(['ACTIVE', 'STOPPED']),
  lastTickTime: z.number(), // Added to track time between ticks
});
export type SimulationInput = z.infer<typeof SimulationInputSchema>;


// Define the output schema. It includes the updated state and also
// any *new* orders or signals generated during this tick.
const SimulationOutputSchema = z.object({
    chartData: z.array(ChartDataSchema),
    positions: z.array(PositionSchema),
    overview: OverviewSchema,
    indicators: z.array(IndicatorSchema),
    optionChain: z.array(OptionSchema),
    newOrders: z.array(OrderSchema),
    newSignals: z.array(SignalSchema),
});
export type SimulationOutput = z.infer<typeof SimulationOutputSchema>;


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

const getNextTime = (time: string, timeframeMinutes: number): string => {
    const date = new Date();
    const [hours, minutes] = time.split(':').map(Number);
    // Find the last candle's time in today's context
    const lastCandleDate = new Date();
    lastCandleDate.setHours(hours, minutes, 0, 0);

    const newCandleDate = new Date(lastCandleDate.getTime() + timeframeMinutes * 60 * 1000);
    return newCandleDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
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
    let { chartData, timeframe, positions, overview, indicators, optionChain, tradingStatus, lastTickTime } = input;
    
    const newOrders: z.infer<typeof OrderSchema>[] = [];
    const newSignals: z.infer<typeof SignalSchema>[] = [];

    // --- MARKET DATA SIMULATION ---
    let newChartData = JSON.parse(JSON.stringify(chartData));
    let currentCandle = newChartData[newChartData.length - 1];
    
    // Simulate price change for this tick
    const lastKnownPrice = currentCandle.ohlc[3];
    const change = (Math.random() - 0.5) * 5;
    const newPrice = lastKnownPrice + change;

    // Determine if the timeframe for the current candle has elapsed
    const now = Date.now();
    const timeframeDuration = timeframes[timeframe] || timeframes['5m'];
    const timeSinceLastTick = now - lastTickTime;

    // This is a simplified way to check if a candle period has passed.
    // In a real scenario, you'd align with actual market time.
    const timeframeMinutes = timeframeDuration / (60 * 1000);
    const lastCandleDate = new Date();
    const [hours, minutes] = currentCandle.time.split(':').map(Number);
    lastCandleDate.setHours(hours, minutes, 0, 0);
    
    const isNewCandleTime = (now - lastCandleDate.getTime()) >= timeframeDuration;

    if (isNewCandleTime) {
        // Finalize the current candle (it's already been updated in previous ticks)
        // and create a new one.
        const newTime = getNextTime(currentCandle.time, timeframeMinutes);

        // --- TRADING LOGIC (Only on new candle & if trading is active) ---
        if (tradingStatus === 'ACTIVE') {
            const priceAction = currentCandle.ohlc[3] - (newChartData[newChartData.length - 2]?.ohlc[3] || currentCandle.ohlc[3]);
            const hasOpenPosition = positions.length > 0;
            
            if (Math.random() < 0.1) { // 10% chance to trade
                const nowLocale = new Date(now).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                if (priceAction > 10 && !hasOpenPosition) {
                    const newPosition: Position = { symbol: 'NIFTY AUG FUT', qty: 50, avgPrice: newPrice, ltp: newPrice, pnl: 0 };
                    positions = [...positions, newPosition];
                    newOrders.push({ time: nowLocale, symbol: 'NIFTY AUG FUT', type: 'BUY', qty: 50, price: newPrice, status: 'EXECUTED' });
                    newSignals.push({ time: nowLocale, strategy: 'SIM-TREND', action: 'ENTER LONG', instrument: 'NIFTY AUG FUT', reason: 'Simulated bullish momentum.'});
                } else if (priceAction < -10 && hasOpenPosition) {
                    const positionToClose = positions[0];
                    newOrders.push({ time: nowLocale, symbol: positionToClose.symbol, type: 'SELL', qty: positionToClose.qty, price: newPrice, status: 'EXECUTED' });
                    
                    const pnlFromTrade = (newPrice - positionToClose.avgPrice) * positionToClose.qty;
                    overview.equity += pnlFromTrade;
                    overview.pnl += pnlFromTrade; // This PNL is now fully realized
                    
                    positions = positions.filter(p => p.symbol !== positionToClose.symbol);
                    newSignals.push({ time: nowLocale, strategy: 'SIM-TREND', action: 'EXIT LONG', instrument: positionToClose.symbol, reason: 'Simulated bearish momentum.'});
                }
            }
        }
        
        // Create the new candle for the next period
        const newCandle = {
            time: newTime,
            ohlc: [newPrice, newPrice, newPrice, newPrice] as [number, number, number, number],
            volume: 0,
        };
        newChartData = [...newChartData.slice(1), newCandle];

    } else {
        // We are still in the same timeframe, so update the current (last) candle
        const [open, high, low, close] = currentCandle.ohlc;
        currentCandle.ohlc = [open, Math.max(high, newPrice), Math.min(low, newPrice), newPrice];
        currentCandle.volume += Math.random() * 1000;
    }

    const newClosePrice = newChartData[newChartData.length-1].ohlc[3];

    // --- UPDATE OTHER MARKET DATA ---
    const newOptionChain = optionChain.map(opt => ({
        ...opt,
        callLTP: Math.max(0, opt.callLTP + getRandom(-0.5, 0.5) - (newClosePrice - opt.strike) / 100),
        putLTP: Math.max(0, opt.putLTP + getRandom(-0.5, 0.5) + (newClosePrice - opt.strike) / 100),
    }));

    const priceMovement = newClosePrice - (chartData[chartData.length - 1]?.ohlc[3] || newClosePrice);
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
        positions = positions.map(pos => {
            const newLtp = newClosePrice; // Simplified: all positions track main instrument
            const pnl = (newLtp - pos.avgPrice) * pos.qty;
            totalUnrealizedPnl += pnl;
            return { ...pos, ltp: newLtp, pnl: pnl };
        });
        
        const realizedPnl = overview.equity - overview.initialEquity;
        overview.pnl = realizedPnl + totalUnrealizedPnl;
        const currentTotalEquity = overview.equity + totalUnrealizedPnl;
        
        overview.peakEquity = Math.max(overview.peakEquity, currentTotalEquity);
        overview.maxDrawdown = Math.max(overview.maxDrawdown, overview.peakEquity - currentTotalEquity);
    }
    
    // Return the new state
    return {
      chartData: newChartData,
      positions,
      overview,
      indicators: newIndicators,
      optionChain: newOptionChain,
      newOrders,
      newSignals,
    };
  }
);

// This is the exported function that the API route will call.
// It wraps the Genkit flow.
export async function runSimulation(input: SimulationInput): Promise<SimulationOutput> {
    return simulationFlow(input);
}
