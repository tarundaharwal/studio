import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
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

const orders = [
    {
        time: '10:05:14',
        symbol: 'NIFTYBEES',
        type: 'BUY',
        qty: 50,
        price: 245.50,
        status: 'EXECUTED',
      },
      {
        time: '09:45:20',
        symbol: 'BANKBEES',
        type: 'BUY',
        qty: 100,
        price: 520.10,
        status: 'EXECUTED',
      },
      {
        time: '11:30:00',
        symbol: 'NIFTYBEES',
        type: 'SELL',
        qty: 50,
        price: 250.00,
        status: 'PENDING',
      },
];

export function OrdersTable() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="p-2">
        <CardTitle>Orders</CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-hidden">
        <div className="h-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="text-xs">
                  <TableHead className="p-2 min-w-[120px]">Symbol</TableHead>
                  <TableHead className="p-2">Type</TableHead>
                  <TableHead className="p-2 text-right">Qty</TableHead>
                  <TableHead className="p-2 text-right">Price</TableHead>
                  <TableHead className="p-2 text-right min-w-[100px]">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order, index) => (
                  <TableRow key={index} className="text-xs">
                    <TableCell className="p-2">
                      <div className="font-medium">{order.symbol}</div>
                      <div className="font-mono text-xs text-muted-foreground">{order.time}</div>
                    </TableCell>
                    <TableCell className="p-2">
                      <Badge variant={order.type === 'BUY' ? 'outline' : 'secondary'} className={order.type === 'BUY' ? 'text-green-600 border-green-600' : 'text-red-600 border-red-600'}>
                        {order.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="p-2 text-right">{order.qty}</TableCell>
                    <TableCell className="p-2 text-right">₹{order.price.toFixed(2)}</TableCell>
                    <TableCell className="p-2 text-right">
                        <Badge variant="outline" className={order.status === 'EXECUTED' ? 'text-blue-600 border-blue-600' : 'text-amber-600 border-amber-600'}>
                            {order.status}
                        </Badge>
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
