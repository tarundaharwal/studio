import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { ScrollArea } from './ui/scroll-area';

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
    <Card className="h-full flex flex-col">
      <CardHeader className="p-4">
        <CardTitle>Positions</CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-x-auto">
        <ScrollArea className="h-full">
          <Table>
            <TableHeader>
              <TableRow className="text-xs">
                <TableHead className="p-2 min-w-[120px]">Symbol</TableHead>
                <TableHead className="p-2 text-right">Qty</TableHead>
                <TableHead className="p-2 text-right">Avg. Price</TableHead>
                <TableHead className="p-2 text-right">LTP</TableHead>
                <TableHead className="p-2 text-right">P&L</TableHead>
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
