
'use server';
/**
 * @fileOverview The backend simulation engine for the IndMon trading dashboard.
 * This flow acts as the "brain" of the simulator, taking the current state of the market
 * and portfolio, and returning the state after one tick of activity.
 * It now includes a deterministic, scripted scenario for testing purposes.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { connectToBroker, getFunds, UserCredentials, Session } from '@/services/angelone';


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
export type Option = z.infer<typeof OptionSchema>;

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
  tradingStatus: z.enum(['ACTIVE', 'STOPPED', 'EMERGENCY_STOP']),
  tickCounter: z.number(),
  session: z.custom<Session>().nullable(),
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
    tradingStatus: z.enum(['ACTIVE', 'STOPPED', 'EMERGENCY_STOP']),
});
export type SimulationOutput = z.infer<typeof SimulationOutputSchema>;


// Helper to generate a random number within a range
const getRandom = (min: number, max: number, precision: number = 2) => {
  return parseFloat((Math.random() * (max - min) + min).toFixed(precision));
};

const getNextTime = (lastTime: string, timeframeMinutes: number): string => {
    const [hours, minutes] = lastTime.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    date.setMinutes(date.getMinutes() + timeframeMinutes);
    return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
};

const calculateRSI = (data: ChartData[], period: number = 14): number | null => {
    if (data.length <= period) return null;
    const prices = data.map(d => d.ohlc[3]); // Use closing prices
    if(prices.length <= period) return null;

    let gains = 0;
    let losses = 0;

    // Calculate initial average gain and loss
    for (let i = 1; i <= period; i++) {
        const change = prices[i] - prices[i-1];
        if (change > 0) gains += change;
        else losses -= change;
    }
    let avgGain = gains / period;
    let avgLoss = losses / period;

    // Calculate subsequent RSI values
    for (let i = period + 1; i < prices.length; i++) {
        const change = prices[i] - prices[i-1];
        const currentGain = change > 0 ? change : 0;
        const currentLoss = change < 0 ? -change : 0;
        avgGain = (avgGain * (period - 1) + currentGain) / period;
        avgLoss = (avgLoss * (period - 1) + currentLoss) / period;
    }

    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
}


// This is the main simulation flow, defined with Genkit
export const simulationFlow = ai.defineFlow(
  {
    name: 'simulationFlow',
    inputSchema: SimulationInputSchema,
    outputSchema: SimulationOutputSchema,
  },
  async (input) => {
    let { chartData, timeframe, positions, overview, indicators, optionChain, tradingStatus, tickCounter, session } = input;
    
    // If we have a session, try to fetch real funds, but only on the first tick
    if (session && tickCounter === 0) {
      try {
        const funds = await getFunds(session);
        overview.initialEquity = funds.net;
        overview.equity = funds.net;
        overview.peakEquity = funds.net;
      } catch (e: any) {
        console.error("Could not fetch funds:", e.message);
        // This might happen if the session is valid but some other API fails.
        // We can let the simulation continue with the default store values.
      }
    }


    let newPositions = [...positions];
    let finalTradingStatus = tradingStatus;
    const newOrders: z.infer<typeof OrderSchema>[] = [];
    const newSignals: z.infer<typeof SignalSchema>[] = [];
    const now = new Date();
    const nowLocale = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    if (tradingStatus === 'STOPPED') {
        return { chartData, positions: newPositions, overview, indicators, optionChain, newOrders, newSignals, tradingStatus };
    }
    
    if (tradingStatus === 'EMERGENCY_STOP') {
        let pnlFromLiquidation = 0;
        const closingPrice = chartData.length > 0 ? chartData[chartData.length - 1].ohlc[3] : 0;
        
        if (newPositions.length > 0) {
            newPositions.forEach(pos => {
                pnlFromLiquidation += (closingPrice - pos.avgPrice) * pos.qty;
                newOrders.push({ time: nowLocale, symbol: pos.symbol, type: 'SELL', qty: pos.qty, price: closingPrice, status: 'EXECUTED' });
            });
            newSignals.push({ time: nowLocale, strategy: 'System', action: 'EMERGENCY STOP', instrument: 'ALL', reason: 'User initiated emergency stop.' });
            
            overview.equity += pnlFromLiquidation;
            newPositions = [];
        }
        
        finalTradingStatus = 'STOPPED';

        return { 
            chartData, 
            positions: newPositions, 
            overview, 
            indicators, 
            optionChain, 
            newOrders, 
            newSignals, 
            tradingStatus: finalTradingStatus 
        };
    }

    // --- SCRIPTED SCENARIO LOGIC ---
    let open = chartData.length > 0 ? chartData[chartData.length - 1].ohlc[3] : 22800;
    let movement = (Math.random() - 0.5) * 20; // Base random movement
    let vol = 150000;
    
    // SCENARIO STEPS DRIVEN BY TICK COUNTER
    
    // Step 1: Sudden Drop -> Alert
    if (tickCounter === 15) { 
        movement = -150;
        vol = 450000;
        newSignals.push({ time: nowLocale, strategy: "Risk Mgmt", action: "ALERT", instrument: "NIFTY 50", reason: "High Volatility Detected" });
    } 
    // Step 2: Buy Signal -> Focused
    else if (tickCounter === 22 && newPositions.length === 0) {
        movement = 20;
        const price = open + movement;
        const newPosition: Position = { symbol: 'NIFTY AUG FUT', qty: 50, avgPrice: price, ltp: price, pnl: 0 };
        newPositions.push(newPosition);
        newOrders.push({ time: nowLocale, symbol: 'NIFTY AUG FUT', type: 'BUY', qty: 50, price: price, status: 'EXECUTED' });
        newSignals.push({ time: nowLocale, strategy: 'Confluence-v1', action: 'BUY', instrument: 'NIFTY AUG FUT', reason: `RSI<30, entering long position.`});
    } 
    // Step 3: Profit State
    else if (tickCounter > 25 && tickCounter <= 35) {
        movement = 25; 
        vol = 250000;
    } 
    // Step 4: Sell Signal (Profit) -> Focused
    else if (tickCounter === 38 && newPositions.length > 0) {
        movement = 15;
        const positionToClose = newPositions[0];
        const price = open + movement;
        const pnlFromTrade = (price - positionToClose.avgPrice) * positionToClose.qty;
        overview.equity += pnlFromTrade;
        newOrders.push({ time: nowLocale, symbol: positionToClose.symbol, type: 'SELL', qty: positionToClose.qty, price, status: 'EXECUTED' });
        newSignals.push({ time: nowLocale, strategy: 'Confluence-v1', action: 'SELL (Profit)', instrument: positionToClose.symbol, reason: `Profit booked: PnL was ${pnlFromTrade.toFixed(2)}`});
        // CRITICAL: Position will be removed on the *next tick* to allow UI to see profit state
    }
    else if (tickCounter === 39) { 
        newPositions = [];
    }
    // Step 5: Re-entry for loss
    else if (tickCounter === 45 && newPositions.length === 0) {
        movement = -20;
        const price = open + movement;
        const newPosition: Position = { symbol: 'NIFTY AUG FUT', qty: 50, avgPrice: price, ltp: price, pnl: 0 };
        newPositions.push(newPosition);
        newOrders.push({ time: nowLocale, symbol: 'NIFTY AUG FUT', type: 'BUY', qty: 50, price: price, status: 'EXECUTED' });
        newSignals.push({ time: nowLocale, strategy: 'Confluence-v1', action: 'BUY', instrument: 'NIFTY AUG FUT', reason: `Re-entering position.`});
    } 
    // Step 6: Big drop for Loss State -> Sell
    else if (tickCounter === 50 && newPositions.length > 0) {
        movement = -150;
        vol = 400000;
        const positionToClose = newPositions[0];
        const price = open + movement;
        const pnlFromTrade = (price - positionToClose.avgPrice) * positionToClose.qty;
        overview.equity += pnlFromTrade;
        newOrders.push({ time: nowLocale, symbol: positionToClose.symbol, type: 'SELL', qty: positionToClose.qty, price, status: 'EXECUTED' });
        newSignals.push({ time: nowLocale, strategy: 'Risk Mgmt', action: 'SELL (Loss)', instrument: positionToClose.symbol, reason: `Loss booked: PnL was ${pnlFromTrade.toFixed(2)}`});
        // CRITICAL: Position will be removed on the *next tick*
    }
    else if (tickCounter === 51) { 
        newPositions = [];
    }


    // --- MARKET DATA SIMULATION ---
    const close = open + movement;
    const high = Math.max(open, close) + getRandom(0, 15);
    const low = Math.min(open, close) - getRandom(0, 15);
    const newPrice = close;

    const lastCandleTime = chartData.length > 0 ? chartData[chartData.length - 1].time : '09:10';
    const newTime = getNextTime(lastCandleTime, 5); // 5 min timeframe

    const newCandle: ChartData = {
        time: newTime,
        ohlc: [open, high, low, close],
        volume: vol + getRandom(10000, 50000),
    };
    const newChartData = [...chartData.slice(1), newCandle];

    // --- UPDATE POSITIONS PNL ---
    let positionsWithPnl = newPositions.map(pos => {
        const pnl = (newPrice - pos.avgPrice) * pos.qty;
        return { ...pos, ltp: newPrice, pnl: parseFloat(pnl.toFixed(2)) };
    });

    // --- UPDATE INDICATORS ---
    const calculatedRSI = calculateRSI(newChartData);
    const newIndicators = indicators.map(ind => {
        let newValue = ind.value;
        if (ind.name.includes('RSI')) {
            newValue = calculatedRSI ?? ind.value;
        } else if (ind.name.includes('MACD')) {
            newValue = ind.value + (movement / 10);
        } else if (ind.name.includes('ADX')) {
            let adxChange = (Math.abs(movement) > 50 ? 2 : -1);
            newValue = Math.max(10, Math.min(100, ind.value + adxChange));
        }
        return {...ind, value: parseFloat(newValue.toFixed(2))};
    });
    
    // --- UPDATE OPTION CHAIN ---
     const newOptionChain = optionChain.map(opt => ({
        ...opt,
        callLTP: Math.max(0, opt.callLTP + getRandom(-0.5, 0.5) - (newPrice - opt.strike) / 100),
        putLTP: Math.max(0, opt.putLTP + getRandom(-0.5, 0.5) + (newPrice - opt.strike) / 100),
    }));

    // --- UPDATE PORTFOLIO DATA ---
    const totalUnrealizedPnl = positionsWithPnl.reduce((acc, pos) => acc + pos.pnl, 0);
    const realizedPnl = overview.equity - overview.initialEquity;
    overview.pnl = parseFloat((realizedPnl + totalUnrealizedPnl).toFixed(2));
    const currentTotalEquity = overview.equity + totalUnrealizedPnl;
    
    overview.peakEquity = Math.max(overview.peakEquity, currentTotalEquity);
    overview.maxDrawdown = Math.max(overview.maxDrawdown, overview.peakEquity - currentTotalEquity);

    // Return the new state
    return {
      chartData: newChartData,
      positions: positionsWithPnl,
      overview,
      indicators: newIndicators,
      optionChain: newOptionChain,
      newOrders,
      newSignals,
      tradingStatus: finalTradingStatus,
    };
  }
);

// This is the exported function that the API route will call.
export async function runSimulation(input: SimulationInput): Promise<SimulationOutput> {
  // If there's no session, we shouldn't be running the simulation.
  // The frontend should ideally prevent this, but this is a safeguard.
  if (!input.session) {
      console.warn("runSimulation called without a session. Returning current state without processing.");
      const { session, ...rest } = input;
      return {
        ...rest,
        newOrders: [],
        newSignals: [],
      };
  }
  return simulationFlow(input);
}
