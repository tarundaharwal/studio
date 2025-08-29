import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';

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
      <CardHeader>
        <CardTitle>Positions</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
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
