import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from '@/components/ui/card';
  import { ScrollArea } from '@/components/ui/scroll-area';
  
  const signals = [
    {
      time: '11:15:02',
      strategy: 'RSI-MR',
      action: 'EXIT LONG',
      instrument: 'NIFTYBEES',
      reason: 'RSI(14) crosses 70.',
    },
    {
      time: '10:05:14',
      strategy: 'SMA-TREND',
      action: 'ENTER LONG',
      instrument: 'NIFTYBEES',
      reason: 'Price crossed above SMA(50).',
    },
    {
      time: '09:45:20',
      strategy: 'RSI-MR',
      action: 'ENTER LONG',
      instrument: 'BANKBEES',
      reason: 'RSI(14) crossed below 30.',
    },
    {
        time: '09:30:10',
        strategy: 'VOLATILITY',
        action: 'STANDBY',
        instrument: 'NIFTYBEES',
        reason: 'ATR below threshold, low volatility regime.',
    },
    {
        time: '09:15:00',
        strategy: 'SYSTEM',
        action: 'INIT',
        instrument: 'ALL',
        reason: 'Market open procedures started.',
    },
  ];
  
  export function SignalsFeed() {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Signals Feed</CardTitle>
          <CardDescription>Live feed of generated trading signals.</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-72">
            <div className="space-y-4">
              {signals.map((signal, index) => (
                <div key={index} className="grid grid-cols-[auto_1fr] gap-x-3 text-sm">
                  <div className="font-mono text-muted-foreground">{signal.time}</div>
                  <div>
                    <span className="font-semibold text-primary">{`[${signal.strategy}]`}</span>
                    <span className={`font-medium ml-2 ${signal.action.includes('LONG') ? 'text-green-600' : signal.action.includes('SHORT') ? 'text-red-600' : ''}`}>
                      {`${signal.action} ${signal.instrument}`}
                    </span>
                    <p className="text-muted-foreground text-xs">{signal.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    );
  }
  