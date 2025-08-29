
import { create } from 'zustand';

// Helper to generate a random number within a range
const getRandom = (min: number, max: number, precision: number = 2) => {
    return parseFloat((Math.random() * (max - min) + min).toFixed(precision));
};


// Generate more realistic OHLCV data
const generateCandlestickData = (count: number, timeframeMinutes: number) => {
    let lastClose = 22750;
    const data = [];
    const now = Date.now();
    
    for (let i = 0; i < count; i++) {
      const open = lastClose;
      const high = open + getRandom(0, 25);
      const low = open - getRandom(0, 25);
      const close = getRandom(low, high);
      const volume = getRandom(50000, 200000);
      lastClose = close;
      data.push({
        time: new Date(now - (count - i) * timeframeMinutes * 60000).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
        ohlc: [open, high, low, close],
        volume: volume,
      })
    }
    return data;
}

const timeframes: { [key: string]: number } = {
    '1m': 1,
    '5m': 5,
    '15m': 15,
    '1h': 60,
};

type ChartData = {
    time: string;
    ohlc: number[];
    volume: number;
}

type Position = {
    symbol: string;
    qty: number;
    avgPrice: number;
    ltp: number;
    pnl: number;
}

type Order = {
    time: string;
    symbol: string;
    type: 'BUY' | 'SELL';
    qty: number;
    price: number;
    status: 'EXECUTED' | 'PENDING' | 'CANCELLED';
}

type Overview = {
    pnl: number;
    drawdown: number;
}

type Indicator = {
    name: string;
    value: number;
}

type Option = {
    strike: number;
    callOI: number;
    callIV: number;
    callLTP: number;
    putLTP: number;
    putIV: number;
    putOI: number;
}

type Signal = {
    time: string;
    strategy: string;
    action: string;
    instrument: string;
    reason: string;
}

type StoreState = {
    chartData: ChartData[];
    timeframe: string;
    positions: Position[];
    orders: Order[];
    overview: Overview;
    indicators: Indicator[];
    optionChain: Option[];
    signals: Signal[];
    setChartData: (newData: ChartData[]) => void;
    addCandle: (newCandle: ChartData) => void;
    setTimeframe: (newTimeframe: string) => void;
    updatePositions: (newPositions: Position[]) => void;
    updateOverview: (newOverview: Partial<Overview>) => void;
    updateIndicators: (newIndicators: Indicator[]) => void;
    updateOptionChain: (newOptionChain: Option[]) => void;
    addSignal: (newSignal: Signal) => void;
    updateOrderStatus: (orderIndex: number, newStatus: Order['status']) => void;
};

export const useStore = create<StoreState>((set, get) => ({
    // Initial State
    chartData: generateCandlestickData(78, timeframes['5m']),
    timeframe: '5m',
    positions: [
        { symbol: 'NIFTY AUG FUT', qty: 50, avgPrice: 22750.50, ltp: 22775.25, pnl: 1237.50 },
        { symbol: 'NIFTY 29 AUG 22800 CE', qty: 100, avgPrice: 118.40, ltp: 125.90, pnl: 750.00 },
    ],
    orders: [
        { time: '10:05:14', symbol: 'NIFTY AUG FUT', type: 'BUY', qty: 50, price: 22750.50, status: 'EXECUTED' },
        { time: '09:45:20', symbol: 'NIFTY 29 AUG 22800 CE', type: 'BUY', qty: 100, price: 118.40, status: 'EXECUTED' },
        { time: '11:30:00', symbol: 'NIFTY AUG FUT', type: 'SELL', qty: 50, price: 22850.00, status: 'PENDING' },
    ],
    overview: {
        pnl: 1250.75,
        drawdown: -4530.10,
    },
    indicators: [
        { name: 'RSI (14)', value: 28.7 },
        { name: 'MACD', value: -12.5 },
        { name: 'ADX (14)', value: 45.2 },
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
    signals: [
        { time: '11:15:05', strategy: 'RSI-MR', action: 'SELL', instrument: 'NIFTYBEES', reason: 'TP hit at 252.10. Profit: +1.2%' },
        { time: '11:15:04', strategy: 'SYSTEM', action: 'MODIFY', instrument: 'NIFTYBEES', reason: 'Trailing SL updated to 251.50.' },
        { time: '10:05:14', strategy: 'SMA-TREND', action: 'ENTER LONG', instrument: 'NIFTYBEES', reason: 'Price crossed above SMA(50). Placing BUY order.' },
    ],

    // Actions
    setChartData: (newData) => set({ chartData: newData }),
    setTimeframe: (newTimeframe) => set({
        timeframe: newTimeframe,
        chartData: generateCandlestickData(78, timeframes[newTimeframe] || 5)
    }),
    addCandle: (newCandle) => set(state => ({
        chartData: [...state.chartData.slice(1), newCandle]
    })),
    updatePositions: (newPositions) => set({ positions: newPositions }),
    updateOverview: (newOverview) => set(state => ({ overview: { ...state.overview, ...newOverview } })),
    updateIndicators: (newIndicators) => set({ indicators: newIndicators }),
    updateOptionChain: (newOptionChain) => set({ optionChain: newOptionChain }),
    addSignal: (newSignal) => set(state => ({ signals: [newSignal, ...state.signals].slice(0, 20) })),
    updateOrderStatus: (orderIndex, newStatus) => set(state => {
        const newOrders = [...state.orders];
        if (newOrders[orderIndex]) {
            newOrders[orderIndex].status = newStatus;
        }
        return { orders: newOrders };
    }),
}));

    
