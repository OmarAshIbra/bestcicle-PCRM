import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Client {
  id: string
  name: string
  company: string | null
  status: string
  lifetime_value: number
}

interface TopClientsProps {
  clients: Client[]
}

export function TopClients({ clients }: TopClientsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Clients</CardTitle>
        <CardDescription>Highest lifetime value clients</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {clients.length === 0 ? (
            <p className="text-sm text-muted-foreground">No clients yet</p>
          ) : (
            clients.map((client, index) => (
              <div key={client.id} className="flex items-center gap-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium leading-none">{client.name}</p>
                  <p className="text-sm text-muted-foreground">{client.company || "No company"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      client.status === "active" ? "default" : client.status === "lead" ? "secondary" : "outline"
                    }
                  >
                    {client.status}
                  </Badge>
                  <div className="text-sm font-semibold">${Number(client.lifetime_value).toLocaleString()}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
