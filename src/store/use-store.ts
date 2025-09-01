
import { create } from 'zustand';

// Helper to generate a random number within a range
const getRandom = (min: number, max: number, precision: number = 2) => {
    return parseFloat((Math.random() * (max - min) + min).toFixed(precision));
};


// Generate a consistent, non-random set of candlestick data
const generateCandlestickData = (count: number, timeframeMinutes: number) => {
    const data = [];
    let lastClose = 22950; // Start at a higher price to create a dip
    const now = new Date();
    now.setHours(15, 30, 0, 0); // Set a fixed end time for consistency
    const interval = timeframeMinutes * 60 * 1000;
    const startTime = now.getTime() - (count * interval);

    // A more complex, pseudo-random but deterministic pattern for realistic charts
    const pseudoRandomFactors = [
        -0.2, -0.3, -0.5, -0.8, -1.1, -1.5, -1.2, -0.9, -0.6, -0.4, // Initial gentle dip
        -1.8, -2.5, -1.9, -1.0, -0.5, 0.1, -0.2, -0.8, -1.4, -2.0, // Steeper dip (trade opportunity here)
        -1.5, -0.8, 0.2, 0.6, 0.9, 1.2, 1.5, 1.8, 2.2, 2.0, 1.7, // Sharp recovery
        1.4, 1.1, 0.8, 0.5, 0.2, -0.1, 0.3, -0.3, 0.5, -0.5,      // Consolidation
        0.7, 0.4, 0.1, -0.2, -0.4, -0.1, 0.2, 0.5, 0.8, 0.6,       // Gentle uptrend
        0.9, 1.1, 1.4, 1.2, 1.0, 0.7, 0.3, 0.0, -0.3, 0.1,
        0.4, 0.7, 1.0, 0.8, 0.5, 0.2, -0.1, 0.1, 0.3, 0.5,
        0.7, 0.9, 1.2, 1.0, 0.8, 0.6, 0.4, 0.2, 0.0
    ];


    for (let i = 0; i < count; i++) {
        const candleTime = new Date(startTime + i * interval);
        const open = lastClose;

        // Use pseudo-random factors to get a consistent pattern
        const factor = pseudoRandomFactors[i % pseudoRandomFactors.length];
        const noise = (Math.sin(i * 0.5) * 5) + (Math.cos(i * 0.2) * 3); // Add some wave-like noise
        const movement = (10 * factor) + noise;

        const close = open + movement;
        
        let high, low;
        const volatility = Math.abs(movement) * 1.5 + 10; // Base volatility
        if (movement > 0) {
            high = close + (volatility * 0.4);
            low = open - (volatility * 0.6);
        } else {
            high = open + (volatility * 0.6);
            low = close - (volatility * 0.4);
        }
        
        // Ensure OHLC integrity
        const finalHigh = Math.max(open, close, high);
        const finalLow = Math.min(open, close, low);


        const volume = 150000 + (Math.abs(factor) * 200000) + (Math.sin(i) * 50000);

        lastClose = close;

        data.push({
            time: candleTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
            ohlc: [open, finalHigh, finalLow, close] as [number, number, number, number],
            volume: Math.round(volume),
        });
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
        const newChartData = generateCandlestickData(78, timeframes[newTimeframe] || 5);
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

    