import {
  File,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const positions = [
  {
    symbol: 'NIFTYBEES',
    qty: 50,
    avgPrice: 245.50,
    ltp: 248.75,
    pnl: 162.50,
  },
  {
    symbol: 'BANKBEES',
    qty: 100,
    avgPrice: 520.10,
    ltp: 518.90,
    pnl: -120.00,
  },
];

export function PositionsTable() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center">
        <div className="grid gap-2">
            <CardTitle>Positions</CardTitle>
            <CardDescription>
                Your currently open positions.
            </CardDescription>
        </div>
        <div className="ml-auto flex items-center gap-2">
            <Button size="sm" variant="outline" className="h-7 gap-1">
                <File className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Export CSV
                </span>
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Symbol</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead className="text-right">Avg. Price</TableHead>
              <TableHead className="text-right">LTP</TableHead>
              <TableHead className="text-right">P&L</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {positions.map((pos) => (
              <TableRow key={pos.symbol}>
                <TableCell>
                  <div className="font-medium">{pos.symbol}</div>
                </TableCell>
                <TableCell className="text-right">{pos.qty}</TableCell>
                <TableCell className="text-right">₹{pos.avgPrice.toFixed(2)}</TableCell>
                <TableCell className="text-right">₹{pos.ltp.toFixed(2)}</TableCell>
                <TableCell className={`text-right font-medium ${pos.pnl > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {pos.pnl > 0 ? '+' : ''}₹{pos.pnl.toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
