
'use client';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from '@/components/ui/card';
  import { ScrollArea } from '@/components/ui/scroll-area';
  import { useStore } from '@/store/use-store';
    
  export function SignalsFeed() {
    const { signals } = useStore();

    return (
      <Card>
        <CardHeader className="p-4">
          <CardTitle>Signals Feed</CardTitle>
          <CardDescription>Live feed of IndMonMachine's trading decisions.</CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <ScrollArea className="h-72">
            <div className="space-y-3">
              {signals.map((signal, index) => (
                <div key={index} className="grid grid-cols-[auto_1fr] gap-x-3 text-sm">
                  <div className="font-mono text-muted-foreground">{signal.time}</div>
                  <div>
                    <span className="font-semibold text-primary">{`[${signal.strategy}]`}</span>
                    <span className={`font-medium ml-2 ${signal.action.includes('LONG') || signal.action.includes('BUY') ? 'text-green-600' : signal.action.includes('SHORT') || signal.action.includes('SELL') ? 'text-red-600' : ''}`}>
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
  