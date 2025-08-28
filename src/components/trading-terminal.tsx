"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"

const chartData = Array.from({ length: 40 }, (_, i) => ({
  time: `${String(9 + Math.floor((i * 5) / 60)).padStart(2, '0')}:${String(
    (i * 5) % 60
  ).padStart(2, '0')}`,
  price:
    250 +
    Math.sin(i / 5) * 5 +
    (Math.random() - 0.5) * 2 -
    (i > 25 ? 5 : 0) +
    (i > 35 ? 10 : 0),
}))

const chartConfig = {
  price: {
    label: "Price",
    color: "hsl(var(--primary))",
  },
}

export function TradingTerminal() {
  return (
    <Card className="overflow-hidden">
      <div className="grid md:grid-cols-3">
        {/* Main Chart Section */}
        <div className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between border-b px-4 py-2">
            <div>
              <Select defaultValue="NIFTYBEES">
                <SelectTrigger className="w-40 border-0 text-lg font-bold shadow-none focus:ring-0">
                  <SelectValue placeholder="Select Instrument" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NIFTYBEES">NIFTYBEES</SelectItem>
                  <SelectItem value="BANKBEES">BANKBEES</SelectItem>
                  <SelectItem value="NIFTY 50">NIFTY 50</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-medium text-green-600">251.80</span>
              <span className="text-green-600">(+0.64%)</span>
              <span>O: 250.50</span>
              <span>H: 252.30</span>
              <span>L: 249.80</span>
              <span>C: 251.80</span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[350px] w-full">
              <ChartContainer config={chartConfig} className="h-full w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{
                      top: 5,
                      right: 10,
                      left: -20,
                      bottom: 0,
                    }}
                  >
                    <defs>
                      <linearGradient id="fillPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="var(--color-price)"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="var(--color-price)"
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis
                      dataKey="time"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      fontSize={12}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      orientation="right"
                      fontSize={12}
                      domain={['dataMin - 2', 'dataMax + 2']}
                      tickFormatter={(value) => `₹${Number(value).toFixed(2)}`}
                    />
                    <Tooltip
                      cursor
                      content={<ChartTooltipContent indicator="dot" />}
                    />
                    <Area
                      dataKey="price"
                      type="monotone"
                      stroke="hsl(var(--primary))"
                      fill="url(#fillPrice)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </div>

        {/* Order Panel Section */}
        <div className="border-l bg-muted/20 p-4">
          <CardTitle className="mb-4">Order Panel</CardTitle>
          <div className="space-y-6">
            <RadioGroup defaultValue="buy" className="grid grid-cols-2 gap-2">
              <div>
                <RadioGroupItem value="buy" id="buy" className="peer sr-only" />
                <Label
                  htmlFor="buy"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-3 text-center text-sm hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground [&:has([data-state=checked])]:border-primary"
                >
                  BUY
                </Label>
              </div>
              <div>
                <RadioGroupItem
                  value="sell"
                  id="sell"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="sell"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-3 text-center text-sm hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-destructive peer-data-[state=checked]:bg-destructive peer-data-[state=checked]:text-destructive-foreground [&:has([data-state=checked])]:border-destructive"
                >
                  SELL
                </Label>
              </div>
            </RadioGroup>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input id="quantity" type="number" placeholder="e.g. 100" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input id="price" type="number" placeholder="e.g. 251.80" />
            </div>

            <div className="space-y-2">
                <RadioGroup defaultValue="market" className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="market" id="market" />
                        <Label htmlFor="market">Market</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="limit" id="limit" />
                        <Label htmlFor="limit">Limit</Label>
                    </div>
                </RadioGroup>
            </div>

            <Button className="w-full">Place Order</Button>

            <div className="text-xs text-muted-foreground space-y-2">
                <div className="flex justify-between">
                    <span>Margin:</span>
                    <span>₹2,518.00</span>
                </div>
                <div className="flex justify-between">
                    <span>Available Funds:</span>
                    <span>₹1,06,250.75</span>
                </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
