"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Users, UserCheck, UserX, DollarSign } from "lucide-react";

interface Client {
  status: string;
  lifetime_value: number;
}

interface ClientStatsProps {
  clients: Client[];
}

export function ClientStats({ clients }: ClientStatsProps) {
  const totalCustomers = clients.length;
  const activeCustomers = clients.filter((c) => c.status === "active").length;
  const churnedCustomers = clients.filter((c) => c.status === "churned").length;

  const avgLifetimeValue =
    clients.length > 0
      ? clients.reduce((sum, c) => sum + Number(c.lifetime_value), 0) /
        clients.length
      : 0;

  const stats = [
    {
      title: "Total Customers",
      value: totalCustomers.toLocaleString(),
      icon: Users,
      iconColor: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Active Customers",
      value: activeCustomers.toLocaleString(),
      icon: UserCheck,
      iconColor: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Churned Customers",
      value: churnedCustomers.toLocaleString(),
      icon: UserX,
      iconColor: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "Avg Lifetime Value",
      value: `$${avgLifetimeValue.toFixed(0)}`,
      icon: DollarSign,
      iconColor: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-full`}>
                  <Icon className={`h-5 w-5 ${stat.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
