import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ClientsTable } from "@/components/clients/clients-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { BulkImportDialog } from "@/components/clients/bulk-import-dialog";

export default async function ClientsPage() {
  const user = await requireAuth();
  const supabase = await createClient();

  // Fetch all clients with assigned user info
  const { data: clients } = await supabase
    .from("clients")
    .select("*, assigned_user:users!clients_assigned_to_fkey(full_name)")
    .order("created_at", { ascending: false });

  const canCreateClients = ["admin", "manager"].includes(user.role);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground">
            Manage your client relationships
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/clients/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Client
            </Link>
          </Button>
          <BulkImportDialog />
        </div>
      </div>

      <ClientsTable clients={clients || []} userRole={user.role} />
    </div>
  );
}
