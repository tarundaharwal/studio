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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from '@/components/ui/select';
import { ScrollArea, ScrollBar } from './ui/scroll-area';
import { Progress } from './ui/progress';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Label } from './ui/label';
import { Input } from './ui/input';

const optionChainData = [
  { strike: 22600, callOI: 150000, callIV: 14.5, callLTP: 250.5, putLTP: 25.1, putIV: 18.2, putOI: 180000 },
  { strike: 22650, callOI: 180000, callIV: 14.2, callLTP: 210.2, putLTP: 35.8, putIV: 17.5, putOI: 160000 },
  { strike: 22700, callOI: 220000, callIV: 13.9, callLTP: 175.8, putLTP: 48.3, putIV: 16.8, putOI: 145000 },
  { strike: 22750, callOI: 280000, callIV: 13.5, callLTP: 145.1, putLTP: 63.5, putIV: 16.1, putOI: 120000 },
  { strike: 22800, callOI: 350000, callIV: 13.1, callLTP: 118.4, putLTP: 82.9, putIV: 15.5, putOI: 100000 },
  { strike: 22850, callOI: 310000, callIV: 12.8, callLTP: 95.2, putLTP: 105.6, putIV: 15.0, putOI: 90000 },
  { strike: 22900, callOI: 250000, callIV: 12.5, callLTP: 75.9, putLTP: 132.1, putIV: 14.6, putOI: 85000 },
  { strike: 22950, callOI: 210000, callIV: 12.2, callLTP: 60.1, putLTP: 155.4, putIV: 14.2, putOI: 80000 },
  { strike: 23000, callOI: 400000, callIV: 12.0, callLTP: 45.5, putLTP: 180.2, putIV: 13.9, putOI: 75000 },
];

const totalPutOI = optionChainData.reduce((acc, row) => acc + row.putOI, 0);
const totalCallOI = optionChainData.reduce((acc, row) => acc + row.callOI, 0);
const pcr = totalPutOI / totalCallOI;

const OrderPopover = ({ ltp, strike, type }: { ltp: number, strike: number, type: 'CALL' | 'PUT' }) => (
    <Popover>
      <PopoverTrigger asChild>
        <span className="block w-full h-full cursor-pointer p-2">{ltp.toFixed(2)}</span>
      </PopoverTrigger>
      <PopoverContent className="w-60">
        <div className="space-y-4">
          <div className="font-bold text-center">
            {type === 'CALL' ? 'Buy Call' : 'Buy Put'} - {strike}
          </div>
          <div className="space-y-2">
            <Label htmlFor="qty">Quantity</Label>
            <Input id="qty" type="number" defaultValue="50" className="h-8" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Price</Label>
            <Input id="price" defaultValue={ltp.toFixed(2)} className="h-8" />
          </div>
          <Button className="w-full h-9" variant={type === 'CALL' ? 'default' : 'destructive'}>
            Place Order
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );

export function OptionChain() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="p-2 space-y-2">
        <div className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Option Chain</CardTitle>
                <CardDescription className="text-xs">NIFTY 50 - 29 AUG 2024</CardDescription>
            </div>
            <div className="flex items-center gap-2">
                <Select defaultValue="10">
                    <SelectTrigger className="w-28 text-xs h-8">
                        <SelectValue placeholder="Strikes" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="10">10 Strikes</SelectItem>
                        <SelectItem value="20">20 Strikes</SelectItem>
                        <SelectItem value="30">30 Strikes</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
        <div className="space-y-1">
            <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-muted-foreground">PCR: <span className="font-bold text-foreground">{pcr.toFixed(2)}</span></span>
                <span className={`font-semibold ${pcr > 1 ? 'text-green-600' : 'text-red-600'}`}>
                    {pcr > 1.2 ? 'Overly Bullish' : pcr > 0.8 ? 'Bullish' : pcr < 0.6 ? 'Overly Bearish' : 'Bearish'}
                </span>
            </div>
            <Progress value={pcr / 2 * 100} className="h-1.5" />
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-1">
      <ScrollArea className="h-full w-full">
        <Table>
          <TableHeader>
            <TableRow className="text-xs">
              <TableHead className="w-[80px] text-center p-1">OI (Lacs)</TableHead>
              <TableHead className="w-[60px] text-center p-1">IV</TableHead>
              <TableHead className="w-[80px] text-center p-1 bg-red-900/10">CALLS LTP</TableHead>
              <TableHead className="w-[100px] text-center font-bold text-foreground p-1">Strike</TableHead>
              <TableHead className="w-[80px] text-center p-1 bg-green-900/10">PUTS LTP</TableHead>
              <TableHead className="w-[60px] text-center p-1">IV</TableHead>
              <TableHead className="w-[80px] text-center p-1">OI (Lacs)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {optionChainData.map((row) => (
              <TableRow key={row.strike} className="text-center text-xs">
                <TableCell className="p-1">{ (row.callOI / 100000).toFixed(2) }</TableCell>
                <TableCell className="p-1">{row.callIV.toFixed(1)}</TableCell>
                <TableCell className="bg-red-900/10 hover:bg-red-900/20 p-0 m-0"><OrderPopover ltp={row.callLTP} strike={row.strike} type="CALL" /></TableCell>
                <TableCell className="font-bold text-sm bg-muted/50 p-1">
                    <Badge variant={row.strike === 22800 ? "default" : "outline"} className="text-xs px-2 py-0.5">{row.strike}</Badge>
                </TableCell>
                <TableCell className="bg-green-900/10 hover:bg-green-900/20 p-0 m-0"><OrderPopover ltp={row.putLTP} strike={row.strike} type="PUT" /></TableCell>
                <TableCell className="p-1">{row.putIV.toFixed(1)}</TableCell>
                <TableCell className="p-1">{ (row.putOI / 100000).toFixed(2) }</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
