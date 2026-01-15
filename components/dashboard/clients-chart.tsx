"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface Client {
  status: string
  created_at: string
}

interface ClientsChartProps {
  clients: Client[]
}

export function ClientsChart({ clients }: ClientsChartProps) {
  // Group clients by status
  const statusCounts = clients.reduce(
    (acc, client) => {
      acc[client.status] = (acc[client.status] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const data = [
    { status: "Lead", count: statusCounts.lead || 0, fill: "hsl(var(--chart-1))" },
    { status: "Active", count: statusCounts.active || 0, fill: "hsl(var(--chart-2))" },
    { status: "Inactive", count: statusCounts.inactive || 0, fill: "hsl(var(--chart-3))" },
    { status: "Churned", count: statusCounts.churned || 0, fill: "hsl(var(--chart-4))" },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Clients by Status</CardTitle>
        <CardDescription>Distribution of clients across different stages</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            count: {
              label: "Clients",
            },
          }}
          className="h-[300px]"
        >
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="status" />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="count" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
