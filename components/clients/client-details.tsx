import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mail, Phone, Building2, Briefcase, DollarSign, Calendar, User } from "lucide-react"
import { format } from "date-fns"

interface ClientDetailsProps {
  client: {
    name: string
    email: string
    phone: string | null
    company: string | null
    industry: string | null
    status: string
    lifetime_value: number
    notes: string | null
    created_at: string
    assigned_user: { full_name: string; email: string } | null
  }
}

const statusColors = {
  lead: "secondary",
  active: "default",
  inactive: "outline",
  churned: "destructive",
} as const

export function ClientDetails({ client }: ClientDetailsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Client Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-muted-foreground">{client.email}</p>
            </div>
          </div>

          {client.phone && (
            <div className="flex items-start gap-3">
              <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">Phone</p>
                <p className="text-sm text-muted-foreground">{client.phone}</p>
              </div>
            </div>
          )}

          {client.company && (
            <div className="flex items-start gap-3">
              <Building2 className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">Company</p>
                <p className="text-sm text-muted-foreground">{client.company}</p>
              </div>
            </div>
          )}

          {client.industry && (
            <div className="flex items-start gap-3">
              <Briefcase className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">Industry</p>
                <p className="text-sm text-muted-foreground">{client.industry}</p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3">
            <DollarSign className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium">Lifetime Value</p>
              <p className="text-sm text-muted-foreground">${Number(client.lifetime_value).toLocaleString()}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <User className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium">Assigned To</p>
              <p className="text-sm text-muted-foreground">{client.assigned_user?.full_name || "Unassigned"}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium">Created</p>
              <p className="text-sm text-muted-foreground">{format(new Date(client.created_at), "MMM d, yyyy")}</p>
            </div>
          </div>

          <div className="pt-2">
            <p className="text-sm font-medium mb-2">Status</p>
            <Badge variant={statusColors[client.status as keyof typeof statusColors]} className="capitalize">
              {client.status}
            </Badge>
          </div>
        </div>

        {client.notes && (
          <div className="space-y-2 pt-4 border-t">
            <p className="text-sm font-medium">Notes</p>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{client.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
