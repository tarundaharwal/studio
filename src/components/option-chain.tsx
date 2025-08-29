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

const optionChainData = [
  { strike: 22600, callOI: 150000, callIV: 14.5, callLTP: 250.5, putLTP: 25.1, putIV: 18.2, putOI: 180000 },
  { strike: 22650, callOI: 180000, callIV: 14.2, callLTP: 210.2, putLTP: 35.8, putIV: 17.5, putOI: 160000 },
  { strike: 22700, callOI: 220000, callIV: 13.9, callLTP: 175.8, putLTP: 48.3, putIV: 16.8, putOI: 145000 },
  { strike: 22750, callOI: 280000, callIV: 13.5, callLTP: 145.1, putLTP: 63.5, putIV: 16.1, putOI: 120000 },
  { strike: 22800, callOI: 350000, callIV: 13.1, callLTP: 118.4, putLTP: 82.9, putIV: 15.5, putOI: 100000 },
  { strike: 22850, callOI: 310000, callIV: 12.8, callLTP: 95.2, putLTP: 105.6, putIV: 15.0, putOI: 90000 },
  { strike: 22900, callOI: 250000, callIV: 12.5, callLTP: 75.9, putLTP: 132.1, putIV: 14.6, putOI: 85000 },
];

export function OptionChain() {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>Option Chain</CardTitle>
            <CardDescription>NIFTY 50 - 29 AUG 2024 Expiry</CardDescription>
        </div>
        <div className="flex items-center gap-2">
            <Select defaultValue="10">
                <SelectTrigger className="w-24">
                    <SelectValue placeholder="Strikes" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="10">10 Strikes</SelectItem>
                    <SelectItem value="20">20 Strikes</SelectItem>
                    <SelectItem value="30">30 Strikes</SelectItem>
                </SelectContent>
            </Select>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px] text-center">OI (Lacs)</TableHead>
              <TableHead className="w-[80px] text-center">IV</TableHead>
              <TableHead className="w-[100px] text-center">LTP</TableHead>
              <TableHead className="w-[120px] text-center font-bold text-foreground">Strike</TableHead>
              <TableHead className="w-[100px] text-center">LTP</TableHead>
              <TableHead className="w-[80px] text-center">IV</TableHead>
              <TableHead className="w-[100px] text-center">OI (Lacs)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {optionChainData.map((row) => (
              <TableRow key={row.strike} className="text-center">
                <TableCell className="bg-red-900/10 text-red-600">{ (row.callOI / 100000).toFixed(2) }</TableCell>
                <TableCell className="bg-red-900/10">{row.callIV.toFixed(1)}</TableCell>
                <TableCell className="bg-red-900/10 hover:bg-red-900/20 cursor-pointer">{row.callLTP.toFixed(2)}</TableCell>
                <TableCell className="font-bold text-lg bg-muted/50">
                    <Badge variant={row.strike === 22800 ? "default" : "outline"} className="text-base px-4 py-1">{row.strike}</Badge>
                </TableCell>
                <TableCell className="bg-green-900/10 hover:bg-green-900/20 cursor-pointer">{row.putLTP.toFixed(2)}</TableCell>
                <TableCell className="bg-green-900/10">{row.putIV.toFixed(1)}</TableCell>
                <TableCell className="bg-green-900/10 text-green-600">{ (row.putOI / 100000).toFixed(2) }</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
