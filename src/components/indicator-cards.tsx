

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { TrendingUp, Waves, Gauge, Move } from 'lucide-react';

export function IndicatorCards() {
  return (
    <>
      <Card className="col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-2 pb-0 md:p-4 md:pb-0">
          <CardTitle className="text-xs font-medium">
            RSI (14)
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-2 md:p-4">
          <div className="text-lg md:text-2xl font-bold">58.6</div>
        </CardContent>
      </Card>

      <Card className="col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-2 pb-0 md:p-4 md:pb-0">
          <CardTitle className="text-xs font-medium">
            MACD
          </CardTitle>
          <Waves className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-2 md:p-4">
          <div className="text-lg md:text-2xl font-bold text-green-600">+12.4</div>
        </CardContent>
      </Card>

      <Card className="col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-2 pb-0 md:p-4 md:pb-0">
          <CardTitle className="text-xs font-medium">ADX (14)</CardTitle>
          <Gauge className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-2 md:p-4">
          <div className="text-lg md:text-2xl font-bold">28.9</div>
        </CardContent>
      </Card>
      
      <Card className="col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-2 pb-0 md:p-4 md:pb-0">
          <CardTitle className="text-xs font-medium">ATR (14)</CardTitle>
          <Move className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-2 md:p-4">
          <div className="text-lg md:text-2xl font-bold">45.2</div>
        </CardContent>
      </Card>
    </>
  );
}
