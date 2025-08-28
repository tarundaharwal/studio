'use client';

import {
  Activity,
  ArrowUpRight,
  CircleUser,
  CreditCard,
  DollarSign,
  Menu,
  Package2,
  Search,
  Users,
  Power,
  PowerOff,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
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

export function OverviewCards() {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Live Status</CardTitle>
          <CardDescription>Real-time system & market health.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="font-medium">Market Status</div>
            <div className="text-right">
              <Badge variant="outline" className="text-green-600 border-green-600">
                Open
              </Badge>
            </div>
            <div className="font-medium">Broker</div>
            <div className="text-right">
              <Badge variant="outline" className="text-green-600 border-green-600">
                Connected
              </Badge>
            </div>
            <div className="font-medium">Latency</div>
            <div className="text-right">
              <Badge variant="outline">12ms</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Global Controls</CardTitle>
          <CardDescription>
            High-level manual overrides for all strategies.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="trading-enabled" className="flex flex-col space-y-1">
              <span>Global Trading</span>
              <span className="font-normal leading-snug text-muted-foreground">
                Enable or disable all trading activity.
              </span>
            </Label>
            <Switch id="trading-enabled" defaultChecked />
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full">
                <Power className="mr-2 h-4 w-4" /> Emergency Stop
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
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Today's P&L
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">+₹1,250.75</div>
          <p className="text-xs text-muted-foreground">
            +1.2% from yesterday
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Max Drawdown</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">-₹4,530.10</div>
          <p className="text-xs text-muted-foreground">
            -4.5% of total equity
          </p>
        </CardContent>
      </Card>
    </>
  );
}
