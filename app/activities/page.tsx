import { requireAuth } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { ActivitiesTable } from "@/components/activities/activities-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default async function ActivitiesPage() {
  const user = await requireAuth()
  const supabase = await createClient()

  // Fetch all activities with related data
  const { data: activities } = await supabase
    .from("activities")
    .select("*, client:clients(id, name, company), user:users(full_name)")
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Activities</h1>
          <p className="text-muted-foreground">Track all client interactions</p>
        </div>
        <Button asChild>
          <Link href="/activities/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Activity
          </Link>
        </Button>
      </div>

      <ActivitiesTable activities={activities || []} currentUserId={user.id} />
    </div>
  )
}
