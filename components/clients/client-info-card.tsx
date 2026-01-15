"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  Phone,
  Building,
  Factory,
  Calendar,
  DollarSign,
  User,
} from "lucide-react";
import { format } from "date-fns";

interface ClientInfoCardProps {
  client: any;
}

export function ClientInfoCard({ client }: ClientInfoCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4 space-y-0">
        <Avatar className="h-16 w-16">
          <AvatarImage
            src={`https://avatar.vercel.sh/${client.email}`}
            alt={client.name}
          />
          <AvatarFallback className="text-lg">
            {client.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <CardTitle className="text-xl">{client.name}</CardTitle>
          <CardDescription>{client.company}</CardDescription>
        </div>
        <div className="ml-auto">
          <Badge
            variant={
              client.status === "active"
                ? "default"
                : client.status === "churned"
                ? "destructive"
                : client.status === "lead"
                ? "secondary"
                : "outline"
            }
          >
            {client.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <h4 className="text-sm font-medium leading-none flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" /> Email
            </h4>
            <p className="text-sm text-muted-foreground break-all">
              {client.email}
            </p>
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-medium leading-none flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" /> Phone
            </h4>
            <p className="text-sm text-muted-foreground">
              {client.phone || "-"}
            </p>
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-medium leading-none flex items-center gap-2">
              <Building className="h-4 w-4 text-muted-foreground" /> Company
            </h4>
            <p className="text-sm text-muted-foreground">
              {client.company || "-"}
            </p>
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-medium leading-none flex items-center gap-2">
              <Factory className="h-4 w-4 text-muted-foreground" /> Industry
            </h4>
            <p className="text-sm text-muted-foreground">
              {client.industry || "-"}
            </p>
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-medium leading-none flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" /> Lifetime
              Value
            </h4>
            <p className="text-sm text-muted-foreground">
              ${Number(client.lifetime_value).toLocaleString()}
            </p>
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-medium leading-none flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" /> Assigned To
            </h4>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {client.assigned_user?.full_name || "Unassigned"}
              </span>
            </div>
          </div>
          <div className="space-y-1 md:col-span-2">
            <h4 className="text-sm font-medium leading-none flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" /> Member
              Since
            </h4>
            <p className="text-sm text-muted-foreground">
              {format(new Date(client.created_at), "MMMM d, yyyy")}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
