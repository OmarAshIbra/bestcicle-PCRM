import { requireRole } from "@/lib/auth";
import { ClientForm } from "@/components/clients/client-form";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function NewClientPage() {
  await requireRole(["admin", "manager"]);
  const supabase = await createClient();

  // Fetch users for assignment dropdown
  const { data: users } = await supabase
    .from("users")
    .select("id, full_name, role")
    .order("full_name");

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/clients">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Clients
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Add New Client</h1>
        <p className="text-muted-foreground">Create a new client profile</p>
      </div>

      <ClientForm users={users || []} />
    </div>
  );
}
