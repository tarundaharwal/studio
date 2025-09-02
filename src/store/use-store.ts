
import { create } from 'zustand';

// Helper to generate a random number within a range
const getRandom = (min: number, max: number, precision: number = 2) => {
    return parseFloat((Math.random() * (max - min) + min).toFixed(precision));
};


// A more sophisticated, realistic chart data generator
const generateCandlestickData = (count: number, timeframeMinutes: number, isTestScenario: boolean = true) => {
    const data = [];
    let lastClose = 22800; // A realistic starting point
    const now = new Date();
    now.setHours(15, 30, 0, 0); // Fix end time for consistency
    const interval = timeframeMinutes * 60 * 1000;
    const startTime = now.getTime() - count * interval;

    // Parameters for a more realistic random walk
    const drift = 0.05; // A very slight upward trend bias
    let volatility = 0.6; // Start with some base volatility

    for (let i = 0; i < count; i++) {
        const candleTime = new Date(startTime + i * interval);
        const open = lastClose;

        // Make volatility dynamic - it can increase or decrease over time
        volatility += (Math.random() - 0.5) * 0.1;
        volatility = Math.max(0.3, Math.min(volatility, 1.2)); // Clamp volatility to realistic range

        // The core random movement - a random value between -1 and 1
        const randomShock = (Math.random() - 0.5) * 2;
        // The movement is influenced by drift, the random shock, and the current volatility
        const movement = drift + randomShock * volatility * 15;

        const close = open + movement;

        // Determine high and low based on volatility
        const highLowSpread = Math.abs(movement) + Math.random() * 25 * volatility;
        const high = Math.max(open, close) + Math.random() * highLowSpread * 0.6; // 60% of spread above
        const low = Math.min(open, close) - Math.random() * highLowSpread * 0.4; // 40% of spread below

        lastClose = close;

        // Volume should be somewhat correlated with the size of the price change
        const volume = 100000 + (Math.abs(movement) * 8000) + (Math.random() * 75000);

        data.push({
            time: candleTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
            ohlc: [open, high, low, close] as [number, number, number, number],
            volume: Math.round(volume),
        });
    }

    if (isTestScenario) {
        // --- SCRIPTED TEST SCENARIO ---
        // This will override the random data to ensure all brain states are triggered.

        // 1. Initial calm period (Thinking state)
        // The first 20 candles will be relatively stable.

        // 2. Volatility Spike (Alert state)
        if (data[25]) {
            const open = data[24].ohlc[3];
            const close = open - 120; // Sudden drop of 120 points
            const low = close - 20;
            const high = open + 10;
            data[25].ohlc = [open, high, low, close];
            data[25].volume = 400000;
        }

        // 3. Create a BUY condition (dip followed by stabilization)
        let dipPrice = data[25]?.ohlc[3] || 22700;
        const buySetup = [
            { move: -20, vol: 0.8 },
            { move: -10, vol: 0.6 }, // RSI should be low here
            { move: 5, vol: 0.5 },   // Stabilization
        ];
        for (let i = 0; i < buySetup.length; i++) {
            const index = 26 + i;
            if (data[index]) {
                const open = dipPrice;
                const close = open + buySetup[i].move;
                data[index].ohlc = [open, open + 5, close - 5, close];
                dipPrice = close;
            }
        }
        
        // 4. Profit Period (Profit state)
        let profitPrice = data[28]?.ohlc[3] || 22700;
        const profitRun = [
            { move: 40, vol: 1.0 },
            { move: 60, vol: 1.2 }, // Should trigger >1% profit
            { move: 50, vol: 1.1 },
        ];
        for (let i = 0; i < profitRun.length; i++) {
            const index = 29 + i;
            if (data[index]) {
                const open = profitPrice;
                const close = open + profitRun[i].move;
                data[index].ohlc = [open, close + 10, open - 5, close];
                profitPrice = close;
            }
        }
        
        // 5. Sell Condition (to take profit)
         if (data[32]) {
            const open = data[31].ohlc[3];
            const close = open + 20; // Push RSI high
            data[32].ohlc = [open, close + 30, open, close];
        }

        // 6. Loss Period (Loss state)
        // Assuming a new trade is entered around candle 40
        let lossPrice = data[40]?.ohlc[3] || 22900;
         const lossRun = [
            { move: 10, vol: 1.0 }, // Entry candle
            { move: -60, vol: 1.2 }, // Big drop
            { move: -50, vol: 1.1 }, // Should trigger >1% loss
        ];
        for (let i = 0; i < lossRun.length; i++) {
            const index = 41 + i;
            if (data[index]) {
                const open = lossPrice;
                const close = open + lossRun[i].move;
                data[index].ohlc = [open, open + 5, close - 10, close];
                lossPrice = close;
            }
        }
    }


    return data;
};



const timeframes: { [key: string]: number } = {
    '1m': 1,
    '5m': 5,
    '15m': 15,
    '1h': 60,
};

export type ChartData = {
    time: string;
    ohlc: [number, number, number, number];
    volume: number;
}

export type Position = {
    symbol: string;
    qty: number;
    avgPrice: number;
    ltp: number;
    pnl: number;
}

export type Order = {
    time: string;
    symbol: string;
    type: 'BUY' | 'SELL';
    qty: number;
    price: number;
    status: 'EXECUTED' | 'PENDING' | 'CANCELLED';
}

export type Overview = {
    equity: number;
    initialEquity: number;
    pnl: number;
    maxDrawdown: number;
    peakEquity: number;
}

export type Indicator = {
    name: string;
    value: number;
}

export type Option = {
    strike: number;
    callOI: number;
    callIV: number;
    callLTP: number;
    putLTP: number;
    putIV: number;
    putOI: number;
}

export type Signal = {
    time: string;
    strategy: string;
    action: string;
    instrument: string;
    reason: string;
}

type TradingStatus = 'ACTIVE' | 'STOPPED' | 'EMERGENCY_STOP';
type CandleType = 'candlestick' | 'heikin-ashi' | 'line';


export type StoreState = {
    chartData: ChartData[];
    timeframe: string;
    positions: Position[];
    orders: Order[];
    overview: Overview;
    indicators: Indicator[];
    optionChain: Option[];
    signals: Signal[];
    tradingStatus: TradingStatus;
    lastTickTime: number; 
    candleType: CandleType;
    setChartData: (newData: ChartData[]) => void;
    setTimeframe: (newTimeframe: string) => void;
    updatePositions: (newPositions: Position[]) => void;
    addOrder: (newOrder: Order) => void;
    updateOverview: (newOverview: Partial<Overview>) => void;
    updateIndicators: (newIndicators: Indicator[]) => void;
    updateOptionChain: (newOptionChain: Option[]) => void;
    addSignal: (newSignal: Signal) => void;
    toggleTradingStatus: () => void;
    setLastTickTime: (time: number) => void; 
    setCandleType: (type: CandleType) => void;
    emergencyStop: () => void;
    setTradingStatus: (status: TradingStatus) => void;
};

const INITIAL_EQUITY = 500000;

export const useStore = create<StoreState>((set, get) => ({
    // Initial State
    chartData: generateCandlestickData(78, timeframes['5m']),
    timeframe: '5m',
    tradingStatus: 'ACTIVE',
    candleType: 'candlestick',
    positions: [],
    orders: [],
    overview: {
        equity: INITIAL_EQUITY,
        initialEquity: INITIAL_EQUITY,
        pnl: 0,
        maxDrawdown: 0,
        peakEquity: INITIAL_EQUITY,
    },
    indicators: [
        { name: 'RSI (14)', value: 50 },
        { name: 'MACD', value: 0 },
        { name: 'ADX (14)', value: 20 },
    ],
    optionChain: [
        { strike: 22600, callOI: 150000, callIV: 14.5, callLTP: 250.5, putLTP: 25.1, putIV: 18.2, putOI: 180000 },
        { strike: 22650, callOI: 180000, callIV: 14.2, callLTP: 210.2, putLTP: 35.8, putIV: 17.5, putOI: 160000 },
        { strike: 22700, callOI: 220000, callIV: 13.9, callLTP: 175.8, putLTP: 48.3, putIV: 16.8, putOI: 145000 },
        { strike: 22750, callOI: 280000, callIV: 13.5, callLTP: 145.1, putLTP: 63.5, putIV: 16.1, putOI: 120000 },
        { strike: 22800, callOI: 350000, callIV: 13.1, callLTP: 118.4, putLTP: 82.9, putIV: 15.5, putOI: 100000 },
        { strike: 22850, callOI: 310000, callIV: 12.8, callLTP: 95.2, putLTP: 105.6, putIV: 15.0, putOI: 90000 },
        { strike: 22900, callOI: 250000, callIV: 12.5, callLTP: 75.9, putLTP: 132.1, putIV: 14.6, putOI: 85000 },
        { strike: 22950, callOI: 210000, callIV: 12.2, callLTP: 60.1, putLTP: 155.4, putIV: 14.2, putOI: 80000 },
        { strike: 23000, callOI: 400000, callIV: 12.0, callLTP: 45.5, putLTP: 180.2, putIV: 13.9, putOI: 75000 },
    ],
    signals: [],
    lastTickTime: Date.now(),

    // Actions
    setTradingStatus: (status) => set({ tradingStatus: status }),
    setCandleType: (type) => set({ candleType: type }),
    setChartData: (newData) => set({ chartData: newData }),
    setTimeframe: (newTimeframe) => set((state) => {
        const newChartData = generateCandlestickData(78, timeframes[newTimeframe] || 5, true); // Keep test scenario on timeframe change
        return {
            timeframe: newTimeframe,
            chartData: newChartData,
            lastTickTime: Date.now(), // Reset tick time on timeframe change
        }
    }),
    updatePositions: (newPositions) => set({ positions: newPositions }),
    addOrder: (newOrder) => set(state => ({ orders: [newOrder, ...state.orders].slice(0, 100) })),
    updateOverview: (newOverview) => set(state => ({ overview: { ...state.overview, ...newOverview } })),
    updateIndicators: (newIndicators) => set({ indicators: newIndicators }),
    updateOptionChain: (newOptionChain) => set({ optionChain: newOptionChain }),
    addSignal: (newSignal) => set(state => ({ signals: [newSignal, ...state.signals].slice(0, 20) })),
    toggleTradingStatus: () => set(state => {
        if (state.tradingStatus === 'EMERGENCY_STOP') return {};
        return { tradingStatus: state.tradingStatus === 'ACTIVE' ? 'STOPPED' : 'ACTIVE' };
    }),
    setLastTickTime: (time) => set({ lastTickTime: time }),
    emergencyStop: () => set(state => {
      // Don't do anything if already stopping
      if (state.tradingStatus === 'EMERGENCY_STOP') return {};
      // Just set the status. The backend will handle the logic.
      return { tradingStatus: 'EMERGENCY_STOP' };
    }),
}));
