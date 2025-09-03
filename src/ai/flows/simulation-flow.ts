'use server';
/**
 * @fileOverview The backend simulation engine for the IndMon trading dashboard.
 * This flow acts as the "brain" of the simulator, taking the current state of the market
 * and portfolio, and returning the state after one tick of activity.
 * It now includes a simple RSI-based trading strategy.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { connectToBroker, getFunds, getLiveMarketData, UserCredentials, Session } from '@/services/angelone';


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
  pnl: z.number(), // This will now represent TOTAL PNL (realized + unrealized)
  realizedPnl: z.number(), // We'll track realized PNL separately
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
    
    // If we have a session, try to fetch real funds.
    if (session) {
      try {
        const funds = await getFunds(session);
        if (tickCounter === 0) { // Set initial equity only once
            overview.initialEquity = funds.net;
            overview.peakEquity = funds.net;
            overview.realizedPnl = 0; // Reset realized PNL on new session
        }
      } catch (e: any) {
        console.error("Could not fetch funds:", e.message);
      }
    }


    let newPositions = [...positions];
    let newOverview = {...overview};
    let finalTradingStatus = tradingStatus;
    const newOrders: z.infer<typeof OrderSchema>[] = [];
    const newSignals: z.infer<typeof SignalSchema>[] = [];
    const now = new Date();
    const nowLocale = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    if (tradingStatus === 'STOPPED') {
        return { chartData, positions: newPositions, overview: newOverview, indicators, optionChain, newOrders, newSignals, tradingStatus };
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
            
            // Add liquidated PNL to the total REALIZED PNL
            newOverview.realizedPnl += pnlFromLiquidation;
            newPositions = [];
        }
        
        finalTradingStatus = 'STOPPED';
        // The final equity will be calculated at the end.
    }
    
    // --- FETCH LIVE DATA ---
    const lastPrice = chartData.length > 0 ? chartData[chartData.length - 1].ohlc[3] : 22800;
    let newPrice = lastPrice;
    if (session) {
        try {
            const marketData = await getLiveMarketData(session, 'NIFTY 50');
            newPrice = marketData.ltp;
        } catch (e: any) {
            console.error("Could not fetch live market data:", e.message);
        }
    }

    // --- MARKET DATA SIMULATION ---
    const open = lastPrice;
    const close = newPrice;
    const high = Math.max(open, close) + getRandom(0, 15);
    const low = Math.min(open, close) - getRandom(0, 15);
    const vol = 150000 + getRandom(10000, 50000);

    const lastCandleTime = chartData.length > 0 ? chartData[chartData.length - 1].time : '09:10';
    const newTime = getNextTime(lastCandleTime, 5); // 5 min timeframe

    const newCandle: ChartData = {
        time: newTime,
        ohlc: [open, high, low, close],
        volume: vol,
    };
    const newChartData = [...chartData.slice(1), newCandle];

    // --- UPDATE INDICATORS ---
    const calculatedRSI = calculateRSI(newChartData);
    const newIndicators = indicators.map(ind => {
        let newValue = ind.value;
        if (ind.name.includes('RSI')) {
            newValue = calculatedRSI ?? ind.value;
        }
        return {...ind, value: parseFloat(newValue.toFixed(2))};
    });
    const currentRSI = newIndicators.find(i => i.name.includes('RSI'))?.value ?? 50;
    
    // --- TRADING STRATEGY LOGIC ---
    const hasOpenPosition = newPositions.length > 0;
    const TRADE_SYMBOL = 'NIFTY50';
    const TRADE_QTY = 50;

    // 1. Sell Condition
    if (hasOpenPosition && currentRSI > 70) {
        const positionToClose = newPositions[0];
        const realizedPnl = (newPrice - positionToClose.avgPrice) * positionToClose.qty;
        
        newOverview.realizedPnl += realizedPnl; // Add realized PNL to the total
        newOrders.push({ time: nowLocale, symbol: TRADE_SYMBOL, type: 'SELL', qty: positionToClose.qty, price: newPrice, status: 'EXECUTED' });
        newSignals.push({ time: nowLocale, strategy: 'RSI_Simple', action: 'SELL_TO_CLOSE', instrument: TRADE_SYMBOL, reason: `RSI > 70 (${currentRSI.toFixed(2)}). Closing position for a profit/loss of ${realizedPnl.toFixed(2)}.` });
        newPositions = []; // Clear positions
    } 
    // 2. Buy Condition
    else if (!hasOpenPosition && currentRSI < 30 && finalTradingStatus === 'ACTIVE') {
        newPositions.push({ symbol: TRADE_SYMBOL, qty: TRADE_QTY, avgPrice: newPrice, ltp: newPrice, pnl: 0 });
        newOrders.push({ time: nowLocale, symbol: TRADE_SYMBOL, type: 'BUY', qty: TRADE_QTY, price: newPrice, status: 'EXECUTED' });
        newSignals.push({ time: nowLocale, strategy: 'RSI_Simple', action: 'BUY_TO_OPEN', instrument: TRADE_SYMBOL, reason: `RSI < 30 (${currentRSI.toFixed(2)}). Entering new long position.` });
    }

    // --- UPDATE POSITIONS PNL ---
    let positionsWithPnl = newPositions.map(pos => {
        const pnl = (newPrice - pos.avgPrice) * pos.qty;
        return { ...pos, ltp: newPrice, pnl: parseFloat(pnl.toFixed(2)) };
    });

    // --- UPDATE OPTION CHAIN ---
     const newOptionChain = optionChain.map(opt => ({
        ...opt,
        callLTP: Math.max(0, opt.callLTP + getRandom(-0.5, 0.5) - (newPrice - opt.strike) / 100),
        putLTP: Math.max(0, opt.putLTP + getRandom(-0.5, 0.5) + (newPrice - opt.strike) / 100),
    }));

    // --- UPDATE PORTFOLIO DATA (REVISED LOGIC) ---
    const totalUnrealizedPnl = positionsWithPnl.reduce((acc, pos) => acc + pos.pnl, 0);
    
    // Total PNL is the sum of all closed trades (realized) and the current open trade (unrealized).
    const totalPnl = newOverview.realizedPnl + totalUnrealizedPnl;
    newOverview.pnl = parseFloat(totalPnl.toFixed(2));
    
    // The final equity is always the starting equity plus the total PNL so far.
    const currentTotalEquity = newOverview.initialEquity + totalPnl;
    newOverview.equity = parseFloat(currentTotalEquity.toFixed(2));
    
    // Update peak equity and drawdown based on the current total equity.
    newOverview.peakEquity = Math.max(newOverview.peakEquity, currentTotalEquity);
    newOverview.maxDrawdown = Math.max(newOverview.maxDrawdown, newOverview.peakEquity - currentTotalEquity);

    // Return the new state
    return {
      chartData: newChartData,
      positions: positionsWithPnl,
      overview: newOverview,
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
  if (!input.session) {
      console.warn("runSimulation called without a session. Returning current state without processing.");
      const { session, tickCounter, ...rest } = input;
      const newOverview = { ...rest.overview, realizedPnl: rest.overview.realizedPnl || 0};
      return {
        ...rest,
        overview: newOverview,
        newOrders: [],
        newSignals: [],
      };
  }
  // Initialize realizedPnl if it doesn't exist
  const newOverview = { ...input.overview, realizedPnl: input.overview.realizedPnl || 0};
  const newInput = { ...input, overview: newOverview };

  return simulationFlow(newInput);
}

