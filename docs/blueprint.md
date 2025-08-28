# **App Name**: Algo Ace

## Core Features:

- Market Data Display: Display real-time market data from Angel One.
- Brokerage Integration: Connect to Angel One's SmartAPI to fetch live quotes and execute trades.
- Risk Management: Implement ATR-based position sizing to dynamically adjust trade sizes based on market volatility. The LLM will use its tool to determine if any static risk constraints would be violated.
- Automated Trading Strategies: Execute trend-following (SMA) and mean-reversion (RSI, Bollinger Bounce) strategies on NIFTYBEES.
- Dashboard and Reporting: Provide a dashboard to monitor positions, orders, and P&L in real-time. Enable CSV export for data analysis.
- Manual Trading Controls: Implement an emergency stop button and global trading toggle on the dashboard to halt all trading activity manually.
- Real-Time Alerts: Alert users via Telegram about order confirmations, circuit breakers, P&L updates, and system heartbeats.

## Style Guidelines:

- Primary color: Deep blue (#3F51B5) to evoke trust and stability, which are essential for a trading platform.
- Background color: Light gray (#F5F5F5), a subtle complement that provides a neutral backdrop, ensuring the interface remains uncluttered and easy to navigate.
- Accent color: Vibrant orange (#FF9800), used to highlight key actions, signals, and alerts.
- Body and headline font: 'Inter', a grotesque-style sans-serif offering a neutral, machined aesthetic conducive to financial applications.
- Code font: 'Source Code Pro' for displaying code snippets.
- Clean, data-driven layout with clear sections for market data, positions, and controls.
- Subtle animations for real-time updates and order confirmations.