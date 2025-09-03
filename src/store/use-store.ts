
import { create } from 'zustand';

const generateCandlestickData = (count: number) => {
    const data = [];
    let lastClose = 22800;
    const now = new Date();
    now.setHours(9, 15, 0, 0); // Start of trading day
    const interval = 5 * 60 * 1000; // 5 minutes
    const startTime = now.getTime() - count * interval;
    
    // This is a heavily scripted test scenario to ensure all brain states are triggered reliably.
    const isTestScenario = true; 
    
    for (let i = 0; i < count; i++) {
        const candleTime = new Date(startTime + i * interval);
        let open = lastClose;
        let movement = (Math.random() - 0.5) * 20; // Base random movement
        let volume = 100000 + (Math.random() * 150000);

        if(isTestScenario) {
            // SCENARIO STEPS DRIVEN BY TICK COUNTER
            if (i === 15) { // Step 1: Sudden Drop -> Alert
                movement = -150;
                volume = 450000;
            } else if (i > 15 && i < 22) {
                movement = (Math.random() - 0.2) * 10; // Calm after drop
            } else if (i === 22) { // Step 2: Buy Signal
                movement = 20;
            } else if (i > 25 && i <= 35) { // Step 3: Profit State
                movement = 25; 
                volume = 250000;
            } else if (i === 38) { // Step 4: Sell Signal (Profit)
                movement = 15;
            } else if (i === 45) { // Step 5: Re-entry for loss
                movement = -20;
            } else if (i === 50) { // Step 6: Big drop for Loss State -> Sell
                movement = -150;
                volume = 400000;
            }
        }


        let close = open + movement;
        let high = Math.max(open, close) + Math.random() * 15;
        let low = Math.min(open, close) - Math.random() * 15;
        lastClose = close;

        data.push({
            time: candleTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
            ohlc: [open, high, low, close] as [number, number, number, number],
            volume: Math.round(volume),
        });
    }
    return data;
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
    tickCounter: number;
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
    setTickCounter: (count: number) => void;
    setCandleType: (type: CandleType) => void;
    emergencyStop: () => void;
    setTradingStatus: (status: TradingStatus) => void;
};

const INITIAL_EQUITY = 500000;

export const useStore = create<StoreState>((set, get) => ({
    // Initial State
    chartData: generateCandlestickData(80),
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
    tickCounter: 0,

    // Actions - These will be simplified as we move logic to the backend.
    setTickCounter: (count) => set({ tickCounter: count }),
    setTradingStatus: (status) => set({ tradingStatus: status }),
    setCandleType: (type) => set({ candleType: type }),
    setChartData: (newData) => set({ chartData: newData }),
    setTimeframe: (newTimeframe) => set({ timeframe: newTimeframe }),
    updatePositions: (newPositions) => set({ positions: newPositions }),
    addOrder: (newOrder) => set(state => ({ orders: [newOrder, ...state.orders].slice(0, 100) })),
    updateOverview: (newOverview) => set(state => ({ overview: { ...state.overview, ...newOverview } })),
    updateIndicators: (newIndicators) => set({ indicators: newIndicators }),
    updateOptionChain: (newOptionChain) => set({ optionChain: newOptionChain }),
    addSignal: (newSignal) => set(state => ({ signals: [newSignal, ...state.signals].slice(0, 20) })),
    setLastTickTime: (time) => set({ lastTickTime: time }),
    
    // These actions will be handled by the real backend soon.
    // The frontend will just send a request and the backend will handle the logic.
    toggleTradingStatus: () => set(state => {
        if (state.tradingStatus === 'EMERGENCY_STOP') return {};
        const newStatus = state.tradingStatus === 'ACTIVE' ? 'STOPPED' : 'ACTIVE';
        // In the future, this will send an API call to the backend to start/stop the trading engine.
        // For now, it just toggles the state and resets the scenario.
        return { tradingStatus: newStatus, tickCounter: 0 };
    }),
    emergencyStop: () => set(state => {
      if (state.tradingStatus === 'EMERGENCY_STOP') return {};
       // In the future, this will send an API call to liquidate all positions.
      return { tradingStatus: 'EMERGENCY_STOP' };
    }),
}));
