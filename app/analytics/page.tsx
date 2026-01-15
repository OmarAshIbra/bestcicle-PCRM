import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { StatsCards } from "@/components/analytics/stats-cards";
import { AnalyticsChart } from "@/components/analytics/analytics-chart";
import { redirect } from "next/navigation";

export default async function AnalyticsPage() {
  const user = await requireAuth();

  if (user.role !== "admin" && user.role !== "manager") {
    redirect("/dashboard");
  }

  const supabase = await createClient();

  // Fetch Stats
  const { count: clientCount } = await supabase
    .from("clients")
    .select("*", { count: "exact", head: true });
  const { count: projectCount } = await supabase
    .from("projects")
    .select("*", { count: "exact", head: true });
  const { count: activeProjectCount } = await supabase
    .from("projects")
    .select("*", { count: "exact", head: true })
    .in("status", ["in_progress", "approved"]);
  const { count: emailCount } = await supabase
    .from("activities")
    .select("*", { count: "exact", head: true })
    .eq("type", "email");

  // Fetch Activity Data for Chart (Mock data logic based on real counts/users could be complex in SQL, simplifying for MVP)
  // We will show activity count per user for the chart
  const { data: users } = await supabase.from("users").select("id, full_name");

  // This part is n+1 but acceptable for small MVP user base, or use a better SQL query with groupBy in real app
  const chartData = [];
  if (users) {
    for (const u of users) {
      const { count } = await supabase
        .from("activities")
        .select("*", { count: "exact", head: true })
        .eq("created_by", u.id);
      chartData.push({
        name: u.full_name,
        total: count || 0,
      });
    }
  }

  const stats = {
    totalClients: clientCount || 0,
    totalProjects: projectCount || 0,
    activeProjects: activeProjectCount || 0,
    totalEmails: emailCount || 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground">
            Overview of system performance and activity
          </p>
        </div>
      </div>

      <StatsCards stats={stats} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4">
          <AnalyticsChart data={chartData} />
        </div>
        <div className="col-span-3">
          {/* Can add another chart or list here later */}
          <div className="rounded-xl border bg-card text-card-foreground shadow h-full p-6 flex items-center justify-center text-muted-foreground">
            More insights coming soon...
          </div>
        </div>
      </div>
    </div>
  );
}
