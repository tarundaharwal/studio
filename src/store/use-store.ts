
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
    equity: number;
    initialEquity: number;
    pnl: number;
    maxDrawdown: number;
    peakEquity: number;
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

type TradingStatus = 'ACTIVE' | 'STOPPED';

type StoreState = {
    chartData: ChartData[];
    timeframe: string;
    positions: Position[];
    orders: Order[];
    overview: Overview;
    indicators: Indicator[];
    optionChain: Option[];
    signals: Signal[];
    tradingStatus: TradingStatus;
    setChartData: (newData: ChartData[]) => void;
    addCandle: (newCandle: ChartData) => void;
    setTimeframe: (newTimeframe: string) => void;
    updatePositions: (newPositions: Position[]) => void;
    addOrder: (newOrder: Order) => void;
    addPosition: (newPosition: Position) => void;
    closePosition: (symbol: string, closePrice: number) => void;
    updateOverview: (newOverview: Partial<Overview>) => void;
    updateIndicators: (newIndicators: Indicator[]) => void;
    updateOptionChain: (newOptionChain: Option[]) => void;
    addSignal: (newSignal: Signal) => void;
    updateOrderStatus: (orderIndex: number, newStatus: Order['status']) => void;
    emergencyStop: () => void;
};

const INITIAL_EQUITY = 5000000; // 50 Lakhs

export const useStore = create<StoreState>((set, get) => ({
    // Initial State
    chartData: generateCandlestickData(78, timeframes['5m']),
    timeframe: '5m',
    tradingStatus: 'ACTIVE',
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
    signals: [],

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
    addOrder: (newOrder) => set(state => ({ orders: [newOrder, ...state.orders].slice(0, 100) })),
    addPosition: (newPosition) => set(state => {
        const cost = newPosition.avgPrice * newPosition.qty;
        const newEquity = state.overview.equity - cost;
        const newPnl = newEquity - state.overview.initialEquity;
        return { 
            positions: [...state.positions, newPosition],
            overview: { ...state.overview, equity: newEquity, pnl: newPnl }
        };
    }),
    closePosition: (symbol, closePrice) => set(state => {
        const positionToClose = state.positions.find(p => p.symbol === symbol);
        if (!positionToClose) return {};

        const proceeds = closePrice * positionToClose.qty;
        const newEquity = state.overview.equity + proceeds;
        const newPeakEquity = Math.max(state.overview.peakEquity, newEquity);
        const newPnl = newEquity - state.overview.initialEquity;
        const newDrawdown = newPeakEquity - newEquity;

        return { 
            positions: state.positions.filter(p => p.symbol !== symbol),
            overview: { 
                ...state.overview, 
                equity: newEquity,
                pnl: newPnl,
                peakEquity: newPeakEquity,
                maxDrawdown: Math.max(state.overview.maxDrawdown, newDrawdown)
            }
        };
    }),
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
    emergencyStop: () => set(state => {
        const now = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
        if (state.tradingStatus === 'STOPPED') return {};

        let currentEquity = state.overview.equity;

        const liquidationOrders: Order[] = state.positions.map(pos => {
            currentEquity += pos.ltp * pos.qty; // Add back liquidated value to equity
            return {
                time: now,
                symbol: pos.symbol,
                type: 'SELL', 
                qty: pos.qty,
                price: pos.ltp, 
                status: 'EXECUTED'
            }
        });
        
        const finalPnl = currentEquity - state.overview.initialEquity;
        const finalPeakEquity = Math.max(state.overview.peakEquity, currentEquity);
        const finalDrawdown = finalPeakEquity - currentEquity;
    
        const updatedOrders = state.orders.map(order => 
            order.status === 'PENDING' ? { ...order, status: 'CANCELLED' } : order
        );
    
        const newOrders = [...liquidationOrders, ...updatedOrders];
    
        const newSignal: Signal = {
            time: now,
            strategy: 'SYSTEM',
            action: 'EMERGENCY STOP',
            instrument: 'ALL',
            reason: 'User triggered emergency stop. Liquidating all positions.'
        };
    
        return {
            positions: [], 
            orders: newOrders,
            signals: [newSignal, ...state.signals].slice(0, 20),
            tradingStatus: 'STOPPED',
            overview: {
                ...state.overview,
                equity: currentEquity,
                pnl: finalPnl,
                peakEquity: finalPeakEquity,
                maxDrawdown: Math.max(state.overview.maxDrawdown, finalDrawdown)
            }
        };
    }),
}));
