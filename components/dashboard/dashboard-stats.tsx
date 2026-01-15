import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserCheck, UserPlus, DollarSign } from "lucide-react"

interface DashboardStatsProps {
  totalClients: number
  activeClients: number
  leads: number
  totalRevenue: number
}

export function DashboardStats({ totalClients, activeClients, leads, totalRevenue }: DashboardStatsProps) {
  const stats = [
    {
      title: "Total Clients",
      value: totalClients,
      icon: Users,
      description: "All clients in system",
    },
    {
      title: "Active Clients",
      value: activeClients,
      icon: UserCheck,
      description: "Currently active",
    },
    {
      title: "Leads",
      value: leads,
      icon: UserPlus,
      description: "Potential clients",
    },
    {
      title: "Total Revenue",
      value: `$${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      description: "Lifetime value",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
