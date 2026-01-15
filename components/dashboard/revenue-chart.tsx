"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface Client {
  lifetime_value: number
  created_at: string
}

interface RevenueChartProps {
  clients: Client[]
}

export function RevenueChart({ clients }: RevenueChartProps) {
  // Group revenue by month
  const revenueByMonth = clients.reduce(
    (acc, client) => {
      const date = new Date(client.created_at)
      const monthYear = date.toLocaleDateString("en-US", { month: "short", year: "2-digit" })
      acc[monthYear] = (acc[monthYear] || 0) + (Number(client.lifetime_value) || 0)
      return acc
    },
    {} as Record<string, number>,
  )

  // Convert to array and sort by date
  const data = Object.entries(revenueByMonth)
    .map(([month, revenue]) => ({
      month,
      revenue,
    }))
    .slice(-6) // Last 6 months

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Trend</CardTitle>
        <CardDescription>Lifetime value by acquisition month</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            revenue: {
              label: "Revenue",
              color: "hsl(var(--chart-1))",
            },
          }}
          className="h-[300px]"
        >
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="month" />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line type="monotone" dataKey="revenue" stroke="hsl(var(--chart-1))" strokeWidth={2} />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
