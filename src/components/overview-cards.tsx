'use client';

import {
  Activity,
  Wallet,
  Power,
  TrendingUp,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useStore } from '@/store/use-store';
import React from 'react';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';


export function OverviewCards() {
  const { overview, tradingStatus, toggleTradingStatus } = useStore();
  const { toast } = useToast();
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const handleEmergencyStop = () => {
    toast({
      title: "Emergency Stop Activated!",
      description: "A signal has been sent to liquidate all positions.",
      variant: "destructive",
    })
  }

  const handleToggleTrading = (checked: boolean) => {
    toggleTradingStatus();
    toast({
      title: `Trading ${checked ? 'Activated' : 'Stopped'}`,
      description: `The system will ${checked ? 'now execute' : 'no longer execute new'} trades.`,
    })
  }


  if (!isClient) {
    return (
        <div className="flex h-12 w-full gap-2">
            <div className="h-full w-40 animate-pulse bg-muted rounded-md"></div>
            <div className="h-full w-40 animate-pulse bg-muted rounded-md"></div>
            <div className="h-full w-40 animate-pulse bg-muted rounded-md"></div>
            <div className="h-full w-40 animate-pulse bg-muted rounded-md"></div>
        </div>
    )
  }

  const pnlPercent = overview.initialEquity > 0 ? (overview.pnl / overview.initialEquity) * 100 : 0;
  const drawdownPercent = overview.peakEquity > 0 ? (overview.maxDrawdown / overview.peakEquity) * 100 : 0;

  return (
    <>
      <Card className="min-w-fit flex-1">
        <CardHeader className="p-2">
          <CardTitle className="text-xs font-medium flex items-center justify-between">
            Global Controls
            <AlertDialog>
              <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="icon" className="h-5 w-5">
                                <Power className="h-3 w-3" />
                            </Button>
                        </AlertDialogTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Emergency Stop</p>
                    </TooltipContent>
                </Tooltip>
              </TooltipProvider>
                <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                    This action will immediately attempt to liquidate all open
                    positions and cancel all open orders. This is irreversible.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleEmergencyStop}>Confirm Emergency Stop</AlertDialogAction>
                </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2 pt-0">
        <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="trading-enabled" className="flex flex-col space-y-0.5">
              <Badge variant={tradingStatus === 'ACTIVE' ? 'outline' : 'secondary'} className={`w-min text-[10px] px-1 ${tradingStatus === 'ACTIVE' ? 'border-green-600 text-green-600' : 'border-red-600 text-red-600'}`}>{tradingStatus}</Badge>
            </Label>
            <Switch id="trading-enabled" checked={tradingStatus === 'ACTIVE'} onCheckedChange={handleToggleTrading} className="h-4 w-8 [&>span]:h-3 [&>span]:w-3 [&>span]:data-[state=checked]:translate-x-4"/>
          </div>
        </CardContent>
      </Card>
      
       <Card className="min-w-fit flex-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-2 pb-1">
          <CardTitle className="text-xs font-medium">
            Balance
          </CardTitle>
          <Wallet className="h-3 w-3 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-2 pt-0">
          <div className="text-base font-bold">
            ₹{overview.equity.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </div>
        </CardContent>
      </Card>

      <Card className="min-w-fit flex-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-2 pb-1">
          <CardTitle className="text-xs font-medium">
            P&L
          </CardTitle>
          <TrendingUp className="h-3 w-3 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-2 pt-0">
            <div className="flex items-baseline gap-2">
                <div className={`text-base font-bold ${overview.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {overview.pnl >= 0 ? '+' : ''}₹{overview.pnl.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </div>
                <p className={`text-[10px] leading-tight ${overview.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    ({overview.pnl >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%)
                </p>
            </div>
        </CardContent>
      </Card>

      <Card className="min-w-fit flex-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-2 pb-1">
          <CardTitle className="text-xs font-medium">Drawdown</CardTitle>
          <Activity className="h-3 w-3 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-2 pt-0">
            <div className="flex items-baseline gap-2">
                <div className="text-base font-bold text-red-600">
                    -₹{overview.maxDrawdown.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </div>
                <p className="text-[10px] leading-tight text-red-500">
                    (-{drawdownPercent.toFixed(2)}%)
                </p>
            </div>
        </CardContent>
      </Card>
    </>
  );
}
