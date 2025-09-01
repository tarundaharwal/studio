
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


// AI Prompt for generating the next candle based on recent data
const MarketSentimentInputSchema = z.object({
    history: z.array(ChartDataSchema),
});

const MarketSentimentOutputSchema = z.object({
    sentiment: z.enum(["BULLISH", "BEARISH", "NEUTRAL"]).describe("The current market sentiment based on the data."),
    nextCandle: z.object({
        high: z.number().describe("The predicted high price for the next candle."),
        low: z.number().describe("The predicted low price for the next candle."),
        close: z.number().describe("The predicted close price for the next candle."),
    }).describe("The predicted price range for the next candle."),
});


const marketSentimentPrompt = ai.definePrompt({
    name: 'marketSentimentPrompt',
    input: { schema: MarketSentimentInputSchema },
    output: { schema: MarketSentimentOutputSchema },
    prompt: `You are a quantitative financial analyst. Based on the last 5 OHLC candles for NIFTY 50, determine the market sentiment and predict a realistic High, Low, and Close for the *next* candle. The open price for the next candle will be the close price of the last candle provided.

Recent Candle Data:
{{#each history}}
- Time: {{time}}, Open: {{ohlc.[0]}}, High: {{ohlc.[1]}}, Low: {{ohlc.[2]}}, Close: {{ohlc.[3]}}
{{/each}}

Analyze the trend, momentum, and volatility from this data to make your prediction. Provide your response in the requested JSON format.
`,
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

// A more robust way to get the next candle time
const getNextTime = (lastTime: string, timeframeMinutes: number): string => {
    const [hours, minutes] = lastTime.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    date.setMinutes(date.getMinutes() + timeframeMinutes);
    return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
};

// Function to calculate RSI
const calculateRSI = (data: ChartData[], period: number = 14): number | null => {
    if (data.length < period + 1) {
        return null; // Not enough data
    }
    
    const prices = data.map(d => d.ohlc[3]);
    let gains = 0;
    let losses = 0;

    // Calculate initial average gain and loss
    for (let i = 1; i <= period; i++) {
        const change = prices[i] - prices[i-1];
        if (change > 0) {
            gains += change;
        } else {
            losses -= change;
        }
    }
    
    let avgGain = gains / period;
    let avgLoss = losses / period;

    // Smooth the averages for the rest of the data
    for (let i = period + 1; i < prices.length; i++) {
        const change = prices[i] - prices[i-1];
        let currentGain = 0;
        let currentLoss = 0;
        
        if (change > 0) {
            currentGain = change;
        } else {
            currentLoss = -change;
        }

        avgGain = (avgGain * (period - 1) + currentGain) / period;
        avgLoss = (avgLoss * (period - 1) + currentLoss) / period;
    }

    if (avgLoss === 0) {
        return 100; // Prevent division by zero
    }

    const rs = avgGain / avgLoss;
    const rsi = 100 - (100 / (1 + rs));
    
    return rsi;
}


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
    
    // Determine if the timeframe for the current candle has elapsed
    const timeframeDuration = timeframes[timeframe] || timeframes['5m'];
    
    const [lastCandleHours, lastCandleMinutes] = currentCandle.time.split(':').map(Number);
    const lastCandleDate = new Date();
    lastCandleDate.setHours(lastCandleHours, lastCandleMinutes, 0, 0);
    
    // We need to check if the current time has crossed into the next timeframe interval
    const now = Date.now();
    const isNewCandleTime = (now - lastCandleDate.getTime()) >= timeframeDuration;
    
    let newPrice: number;

    if (isNewCandleTime) {
        // AI-POWERED NEW CANDLE GENERATION
        const recentHistory = newChartData.slice(-5);
        const { output } = await marketSentimentPrompt({ history: recentHistory });

        if (!output) {
            throw new Error("AI failed to generate new candle data.");
        }

        const { nextCandle: predictedCandle } = output;
        
        const newOpen = currentCandle.ohlc[3]; // New candle opens at last close
        newPrice = predictedCandle.close; // The final price for this new candle interval

        const timeframeMinutes = timeframeDuration / (60 * 1000);
        const newTime = getNextTime(currentCandle.time, timeframeMinutes);

        const newCandleForRSI: ChartData = {
            time: newTime,
            ohlc: [newOpen, predictedCandle.high, predictedCandle.low, predictedCandle.close],
            volume: getRandom(50000, 250000),
        };
        
        const rsiChartData = [...newChartData, newCandleForRSI];
        const currentRSI = calculateRSI(rsiChartData);

        // --- TRADING LOGIC (Only on new candle & if trading is active) ---
        if (tradingStatus === 'ACTIVE' && currentRSI !== null) {
            const hasOpenPosition = positions.length > 0;
            const nowLocale = new Date(now).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

            // RSI Buy Condition
            if (currentRSI < 30 && !hasOpenPosition) {
                const newPosition: Position = { symbol: 'NIFTY AUG FUT', qty: 50, avgPrice: newPrice, ltp: newPrice, pnl: 0 };
                positions = [...positions, newPosition];
                newOrders.push({ time: nowLocale, symbol: 'NIFTY AUG FUT', type: 'BUY', qty: 50, price: newPrice, status: 'EXECUTED' });
                newSignals.push({ time: nowLocale, strategy: 'RSI-Reversion', action: 'ENTER LONG', instrument: 'NIFTY AUG FUT', reason: `RSI is oversold (< 30) at ${currentRSI.toFixed(2)}.`});
            
            // RSI Sell Condition
            } else if (currentRSI > 70 && hasOpenPosition) {
                const positionToClose = positions[0];
                newOrders.push({ time: nowLocale, symbol: positionToClose.symbol, type: 'SELL', qty: positionToClose.qty, price: newPrice, status: 'EXECUTED' });
                
                const pnlFromTrade = (newPrice - positionToClose.avgPrice) * positionToClose.qty;
                overview.equity += pnlFromTrade;
                
                positions = positions.filter(p => p.symbol !== positionToClose.symbol);
                newSignals.push({ time: nowLocale, strategy: 'RSI-Reversion', action: 'EXIT LONG', instrument: positionToClose.symbol, reason: `RSI is overbought (> 70) at ${currentRSI.toFixed(2)}.`});
            }
        }
        
        // Create the new candle for the next period, using AI-generated data
        newChartData = [...newChartData.slice(1), newCandleForRSI];

    } else {
        // We are still in the same timeframe, so update the current (last) candle
        const lastKnownPrice = currentCandle.ohlc[3];
        const change = (Math.random() - 0.5) * 5; // Simple random fluctuation within the candle
        newPrice = lastKnownPrice + change;
        
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

    const calculatedRSI = calculateRSI(newChartData);

    const newIndicators = indicators.map(ind => {
        let newValue = ind.value;
        if (ind.name.includes('RSI')) newValue = calculatedRSI ?? ind.value;
        else if (ind.name.includes('MACD')) newValue = ind.value + (newClosePrice - chartData[chartData.length - 1].ohlc[3])/10;
        else if (ind.name.includes('ADX')) newValue = Math.max(10, ind.value + (Math.abs(newClosePrice - chartData[chartData.length - 1].ohlc[3]) > 1 ? 0.5 : -0.2));
        return {...ind, value: parseFloat(newValue.toFixed(2))};
    });

    // --- UPDATE PORTFOLIO DATA ---
    let totalUnrealizedPnl = 0;
    positions = positions.map(pos => {
        const newLtp = newClosePrice; // Simplified: all positions track main instrument
        const pnl = (newLtp - pos.avgPrice) * pos.qty;
        totalUnrealizedPnl += pnl;
        return { ...pos, ltp: newLtp, pnl: parseFloat(pnl.toFixed(2)) };
    });
    
    const realizedPnl = overview.equity - overview.initialEquity;
    overview.pnl = parseFloat((realizedPnl + totalUnrealizedPnl).toFixed(2));
    const currentTotalEquity = overview.equity + totalUnrealizedPnl;
    
    overview.peakEquity = Math.max(overview.peakEquity, currentTotalEquity);
    overview.maxDrawdown = Math.max(overview.maxDrawdown, overview.peakEquity - currentTotalEquity);
    
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
