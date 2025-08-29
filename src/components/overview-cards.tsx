
'use client';

import {
  Activity,
  DollarSign,
  Power,
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


export function OverviewCards() {
  const { overview } = useStore();
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);


  if (!isClient) {
    return (
        <>
            <Card className="h-24 animate-pulse bg-muted"></Card>
            <Card className="h-24 animate-pulse bg-muted"></Card>
            <Card className="h-36 animate-pulse bg-muted"></Card>
            <Card className="h-36 animate-pulse bg-muted"></Card>
        </>
    )
  }

  return (
    <>
      <Card>
        <CardHeader className="p-2">
          <CardTitle className="text-base">Live Status</CardTitle>
        </CardHeader>
        <CardContent className="p-2 pt-0">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
            <div className="font-medium">Market Status</div>
            <div className="text-right">
              <Badge variant="outline" className="text-green-600 border-green-600 text-xs">
                Open
              </Badge>
            </div>
            <div className="font-medium">Broker</div>
            <div className="text-right">
              <Badge variant="outline" className="text-green-600 border-green-600 text-xs">
                Connected
              </Badge>
            </div>
            <div className="font-medium">Latency</div>
            <div className="text-right">
              <Badge variant="outline" className="text-xs">12ms</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="p-2">
          <CardTitle className="text-base">Global Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 p-2 pt-0">
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="trading-enabled" className="flex flex-col">
              <span className="text-xs">Global Trading</span>
            </Label>
            <Switch id="trading-enabled" defaultChecked className="h-5 w-9 [&>span]:h-4 [&>span]:w-4 [&>span]:data-[state=checked]:translate-x-4"/>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full h-8 text-xs">
                <Power className="mr-1 h-3 w-3" /> Emergency Stop
              </Button>
            </AlertDialogTrigger>
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
                <AlertDialogAction>Confirm Emergency Stop</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
          <CardTitle className="text-sm font-medium">
            Today's P&L
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className={`text-2xl font-bold ${overview.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {overview.pnl >= 0 ? '+' : ''}₹{overview.pnl.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          <p className="text-xs text-muted-foreground">
            {overview.pnl >= 0 ? '+' : '-'}1.2% from yesterday
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
          <CardTitle className="text-sm font-medium">Max Drawdown</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="text-2xl font-bold">
            ₹{overview.drawdown.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          <p className="text-xs text-muted-foreground">
            -4.5% of total equity
          </p>
        </CardContent>
      </Card>
    </>
  );
}
