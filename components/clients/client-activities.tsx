import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { Mail, Phone, Calendar, FileText, Clock } from "lucide-react"

interface Activity {
  id: string
  type: string
  subject: string
  description: string | null
  status: string
  scheduled_at: string | null
  created_at: string
  user: { full_name: string } | null
}

interface ClientActivitiesProps {
  activities: Activity[]
  clientId: string
}

const activityIcons = {
  email: Mail,
  call: Phone,
  meeting: Calendar,
  note: FileText,
  task: FileText,
}

const statusColors = {
  scheduled: "secondary",
  completed: "default",
  cancelled: "outline",
} as const

export function ClientActivities({ activities }: ClientActivitiesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Timeline</CardTitle>
        <CardDescription>All interactions and activities for this client</CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">No activities yet</p>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => {
              const Icon = activityIcons[activity.type as keyof typeof activityIcons] || FileText
              return (
                <div key={activity.id} className="flex gap-4 pb-4 border-b last:border-0 last:pb-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{activity.subject}</p>
                          <Badge variant={statusColors[activity.status as keyof typeof statusColors]}>
                            {activity.status}
                          </Badge>
                        </div>
                        {activity.description && (
                          <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{activity.user?.full_name}</span>
                      <span>•</span>
                      <span>{formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}</span>
                      {activity.scheduled_at && (
                        <>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>Scheduled for {formatDistanceToNow(new Date(activity.scheduled_at))}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
