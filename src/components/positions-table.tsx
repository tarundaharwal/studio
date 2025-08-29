
'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Zap } from 'lucide-react';
import { useStore } from '@/store/use-store';

export function PositionsTable() {
  const { positions } = useStore();

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="p-2">
        <CardTitle>Positions</CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-hidden">
        <div className="h-full overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="text-xs">
                <TableHead className="p-2 min-w-[120px]">Symbol</TableHead>
                <TableHead className="p-2 text-right">Qty</TableHead>
                <TableHead className="p-2 text-right">Avg. Price</TableHead>
                <TableHead className="p-2 text-right">LTP</TableHead>
                <TableHead className="p-2 text-right">P&L</TableHead>
                <TableHead className="p-2 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {positions.map((pos) => (
                <TableRow key={pos.symbol} className="text-xs">
                  <TableCell className="p-2">
                    <div className="font-medium">{pos.symbol}</div>
                  </TableCell>
                  <TableCell className="p-2 text-right">{pos.qty}</TableCell>
                  <TableCell className="p-2 text-right">₹{pos.avgPrice.toFixed(2)}</TableCell>
                  <TableCell className="p-2 text-right">₹{pos.ltp.toFixed(2)}</TableCell>
                  <TableCell className={`p-2 text-right font-medium ${pos.pnl > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {pos.pnl > 0 ? '+' : ''}₹{pos.pnl.toFixed(2)}
                  </TableCell>
                  <TableCell className="p-2 text-right">
                    <Button variant="outline" size="sm" className="h-7 text-xs">
                        <Zap className="mr-1 h-3 w-3" />
                        Exit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
