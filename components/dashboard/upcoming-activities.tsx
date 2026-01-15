import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { Calendar, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Activity {
  id: string
  type: string
  subject: string
  scheduled_at: string | null
  client: { name: string } | null
}

interface UpcomingActivitiesProps {
  activities: Activity[]
}

export function UpcomingActivities({ activities }: UpcomingActivitiesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Activities</CardTitle>
        <CardDescription>Scheduled for the next 7 days</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <p className="text-sm text-muted-foreground">No upcoming activities</p>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium leading-none">{activity.subject}</p>
                    <Badge variant="outline" className="text-xs">
                      {activity.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{activity.client?.name}</p>
                  {activity.scheduled_at && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {format(new Date(activity.scheduled_at), "MMM d, yyyy 'at' h:mm a")}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
