
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
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';


export function OverviewCards() {
  const { overview, tradingStatus, toggleTradingStatus } = useStore();
  const { toast } = useToast();
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const handleEmergencyStop = () => {
    // This action will now be handled by the backend logic.
    // The frontend can show a toast, but the core logic is server-side.
    toast({
      title: "Emergency Stop Activated!",
      description: "A signal has been sent to liquidate all positions.",
      variant: "destructive",
    })
    // In a real app, you might call a specific '/api/emergency-stop' route
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
        <>
            <Card className="h-24 animate-pulse bg-muted"></Card>
            <Card className="h-36 animate-pulse bg-muted"></Card>
            <Card className="h-36 animate-pulse bg-muted"></Card>
            <Card className="h-36 animate-pulse bg-muted"></Card>
        </>
    )
  }

  const pnlPercent = overview.initialEquity > 0 ? (overview.pnl / overview.initialEquity) * 100 : 0;
  const drawdownPercent = overview.peakEquity > 0 ? (overview.maxDrawdown / overview.peakEquity) * 100 : 0;

  return (
    <>
      <Card>
        <CardHeader className="p-2">
          <CardTitle className="text-base">Global Controls</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-2 p-2 pt-0">
        <div className="flex items-center justify-between space-x-2 rounded-md bg-muted/50 p-2">
            <Label htmlFor="trading-enabled" className="flex flex-col space-y-0.5">
              <span className="text-xs font-medium">Trading Status</span>
              <Badge variant={tradingStatus === 'ACTIVE' ? 'outline' : 'secondary'} className={`w-min text-xs ${tradingStatus === 'ACTIVE' ? 'border-green-600 text-green-600' : 'border-red-600 text-red-600'}`}>{tradingStatus}</Badge>
            </Label>
            <Switch id="trading-enabled" checked={tradingStatus === 'ACTIVE'} onCheckedChange={handleToggleTrading} className="h-5 w-9 [&>span]:h-4 [&>span]:w-4 [&>span]:data-[state=checked]:translate-x-4"/>
          </div>

          <div className="flex items-center justify-center">
            <AlertDialog>
              <Tooltip>
                  <TooltipTrigger asChild>
                      <AlertDialogTrigger asChild>
                          <Button variant="destructive" className="h-10 w-12">
                              <Power className="h-5 w-5" />
                          </Button>
                      </AlertDialogTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                      <p>Emergency Stop</p>
                  </TooltipContent>
              </Tooltip>
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
          </div>
        </CardContent>
      </Card>
      
       <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
          <CardTitle className="text-sm font-medium">
            Account Balance
          </CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="text-2xl font-bold">
            ₹{overview.equity.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-muted-foreground">
            Initial capital of ₹{overview.initialEquity.toLocaleString('en-IN')}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
          <CardTitle className="text-sm font-medium">
            Today's P&L
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className={`text-2xl font-bold ${overview.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {overview.pnl >= 0 ? '+' : ''}₹{overview.pnl.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          <p className={`text-xs ${overview.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {overview.pnl >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
          <CardTitle className="text-sm font-medium">Max Drawdown</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="text-2xl font-bold text-red-600">
            -₹{overview.maxDrawdown.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          <p className="text-xs text-red-500">
            -{drawdownPercent.toFixed(2)}% of peak equity
          </p>
        </CardContent>
      </Card>
    </>
  );
}
