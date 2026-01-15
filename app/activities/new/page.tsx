import { requireAuth } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import { ActivityForm } from "@/components/activities/activity-form"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default async function NewActivityPage() {
  await requireAuth()
  const supabase = await createClient()

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
        <h1 className="text-3xl font-bold tracking-tight">Add New Activity</h1>
        <p className="text-muted-foreground">Schedule a new client interaction</p>
      </div>

      <ActivityForm clients={clients || []} />
    </div>
  )
}
