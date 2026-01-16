import type React from "react";
import { requireAuth } from "@/lib/auth";
import { DashboardLayout as DashboardLayoutComponent } from "@/components/layout/dashboard-layout";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth();

  return (
    <DashboardLayoutComponent user={user}>{children}</DashboardLayoutComponent>
  );
}
