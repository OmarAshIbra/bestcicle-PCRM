import { requireAuth } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { ActivityForm } from "@/components/activities/activity-form"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

interface EditActivityPageProps {
  params: Promise<{ id: string }>
}

export default async function EditActivityPage({ params }: EditActivityPageProps) {
  const { id } = await params
  const user = await requireAuth()
  const supabase = await createClient()

  // Fetch activity to edit
  const { data: activity } = await supabase.from("activities").select("*").eq("id", id).single()

  if (!activity) {
    notFound()
  }

  // Check if user can edit (own activity or admin)
  if (activity.user_id !== user.id && user.role !== "admin") {
    throw new Error("Forbidden")
  }

  // Fetch clients for dropdown
  const { data: clients } = await supabase.from("clients").select("id, name, company, status").order("name")

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/activities">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Activities
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Edit Activity</h1>
        <p className="text-muted-foreground">Update activity details</p>
      </div>

      <ActivityForm activity={activity} clients={clients || []} />
    </div>
  )
}
