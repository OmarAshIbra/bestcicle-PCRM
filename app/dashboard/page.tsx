import { requireAuth } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { ClientsChart } from "@/components/dashboard/clients-chart"
import { RevenueChart } from "@/components/dashboard/revenue-chart"
import { TopClients } from "@/components/dashboard/top-clients"
import { UpcomingActivities } from "@/components/dashboard/upcoming-activities"

export default async function DashboardPage() {
  const user = await requireAuth()
  const supabase = await createClient()

  // Fetch dashboard data
  const [clientsData, activitiesData, revenueData] = await Promise.all([
    supabase.from("clients").select("*"),
    supabase
      .from("activities")
      .select("*, client:clients(name), user:users(full_name)")
      .order("created_at", { ascending: false })
      .limit(10),
    supabase.from("clients").select("status, lifetime_value"),
  ])

  const clients = clientsData.data || []
  const activities = activitiesData.data || []

  // Calculate stats
  const totalClients = clients.length
  const activeClients = clients.filter((c) => c.status === "active").length
  const leads = clients.filter((c) => c.status === "lead").length
  const totalRevenue = clients.reduce((sum, client) => sum + (Number(client.lifetime_value) || 0), 0)

  // Get upcoming activities (next 7 days)
  const now = new Date()
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  const upcomingActivities = activities.filter((a) => {
    if (!a.scheduled_at || a.status === "completed") return false
    const scheduledDate = new Date(a.scheduled_at)
    return scheduledDate >= now && scheduledDate <= nextWeek
  })

  // Get top clients by lifetime value
  const topClients = [...clients]
    .sort((a, b) => (Number(b.lifetime_value) || 0) - (Number(a.lifetime_value) || 0))
    .slice(0, 5)

  // Calculate client growth data (by month)
  const clientsByMonth = clients.reduce(
    (acc, client) => {
      const month = new Date(client.created_at).toLocaleDateString("en-US", { month: "short" })
      acc[month] = (acc[month] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user.full_name}</p>
      </div>

      <DashboardStats
        totalClients={totalClients}
        activeClients={activeClients}
        leads={leads}
        totalRevenue={totalRevenue}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <ClientsChart clients={clients} />
        <RevenueChart clients={clients} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <RecentActivity activities={activities.slice(0, 5)} />
        <UpcomingActivities activities={upcomingActivities} />
      </div>

      <TopClients clients={topClients} />
    </div>
  )
}
