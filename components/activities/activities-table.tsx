"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pencil, Search, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface Activity {
  id: string
  type: string
  subject: string
  description: string | null
  status: string
  scheduled_at: string | null
  created_at: string
  client: { id: string; name: string; company: string | null } | null
  user: { full_name: string } | null
  user_id: string
}

interface ActivitiesTableProps {
  activities: Activity[]
  currentUserId: string
}

const typeColors = {
  email: "default",
  call: "secondary",
  meeting: "default",
  note: "outline",
  task: "secondary",
} as const

const statusColors = {
  scheduled: "secondary",
  completed: "default",
  cancelled: "outline",
} as const

export function ActivitiesTable({ activities, currentUserId }: ActivitiesTableProps) {
  const router = useRouter()
  const supabase = createClient()
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredActivities = activities.filter((activity) => {
    const matchesSearch =
      activity.subject.toLowerCase().includes(search.toLowerCase()) ||
      activity.client?.name.toLowerCase().includes(search.toLowerCase())

    const matchesType = typeFilter === "all" || activity.type === typeFilter
    const matchesStatus = statusFilter === "all" || activity.status === statusFilter

    return matchesSearch && matchesType && matchesStatus
  })

  async function handleMarkComplete(activityId: string) {
    try {
      await supabase
        .from("activities")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
        })
        .eq("id", activityId)

      router.refresh()
    } catch (error) {
      console.error("[v0] Error marking activity complete:", error)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search activities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="call">Call</SelectItem>
            <SelectItem value="meeting">Meeting</SelectItem>
            <SelectItem value="note">Note</SelectItem>
            <SelectItem value="task">Task</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Activity</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Scheduled</TableHead>
              <TableHead className="w-[120px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredActivities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No activities found.
                </TableCell>
              </TableRow>
            ) : (
              filteredActivities.map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{activity.subject}</div>
                      {activity.description && (
                        <div className="text-sm text-muted-foreground line-clamp-1">{activity.description}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{activity.client?.name}</div>
                      {activity.client?.company && (
                        <div className="text-sm text-muted-foreground">{activity.client.company}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={typeColors[activity.type as keyof typeof typeColors]} className="capitalize">
                      {activity.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusColors[activity.status as keyof typeof statusColors]} className="capitalize">
                      {activity.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{activity.user?.full_name}</TableCell>
                  <TableCell>
                    {activity.scheduled_at ? format(new Date(activity.scheduled_at), "MMM d, yyyy h:mm a") : "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {activity.status === "scheduled" && activity.user_id === currentUserId && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkComplete(activity.id)}
                          title="Mark as complete"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                      )}
                      {activity.user_id === currentUserId && (
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/activities/${activity.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
