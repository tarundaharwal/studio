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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"

const chartData = Array.from({ length: 96 }, (_, i) => ({
    time: `${String(9 + Math.floor((i * 5) / 60)).padStart(2, '0')}:${String(
      (i * 5) % 60
    ).padStart(2, '0')}`,
    price:
      22750 +
      Math.sin(i / 5) * 20 +
      (Math.random() - 0.5) * 8 +
      (i > 45 ? 15 : 0) +
      (i > 75 ? -25 : 0),
  }))

const chartConfig = {
  price: {
    label: "Price",
    color: "hsl(var(--primary))",
  },
}

export function TradingTerminal() {
  return (
    <Card className="overflow-hidden h-full">
      <CardHeader className="flex flex-row items-center justify-between border-b px-4 py-2">
        <div>
          <Select defaultValue="NIFTY 50">
            <SelectTrigger className="w-40 border-0 text-lg font-bold shadow-none focus:ring-0">
              <SelectValue placeholder="Select Instrument" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NIFTY 50">NIFTY 50</SelectItem>
              <SelectItem value="BANKNIFTY">BANKNIFTY</SelectItem>
              <SelectItem value="NIFTYBEES">NIFTYBEES</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-medium text-green-600">22,780.50</span>
          <span className="text-green-600">(+0.34%)</span>
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
                  interval={11}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  orientation="right"
                  fontSize={12}
                  domain={['dataMin - 20', 'dataMax + 20']}
                  tickFormatter={(value) => `${Number(value).toFixed(0)}`}
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
    </Card>
  )
}
