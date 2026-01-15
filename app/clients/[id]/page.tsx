import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ClientInfoCard } from "@/components/clients/client-info-card";
import { ClientProjectsCard } from "@/components/clients/client-projects-card";
import { ClientMeetingsCard } from "@/components/clients/client-meetings-card";
import { ClientEmailsCard } from "@/components/clients/client-emails-card";
import { ClientNotesCard } from "@/components/clients/client-notes-card";
import { ClientTasksCard } from "@/components/clients/client-tasks-card";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default async function ClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireAuth();
  const supabase = await createClient();
  const { id } = await params;

  // Fetch client details
  const { data: client } = await supabase
    .from("clients")
    .select("*, assigned_user:users!clients_assigned_to_fkey(full_name)")
    .eq("id", id)
    .single();

  if (!client) {
    notFound();
  }

  // Fetch related data in parallel
  const [{ data: projects }, { data: tasks }, { data: activities }] =
    await Promise.all([
      supabase
        .from("projects")
        .select("*")
        .eq("client_id", id)
        .order("updated_at", { ascending: false }),
      supabase
        .from("tasks")
        .select("*")
        .eq("client_id", id)
        .order("due_date", { ascending: true }),
      supabase
        .from("activities")
        .select("*")
        .eq("client_id", id)
        .order("created_at", { ascending: false }),
    ]);

  // Filter activities
  const emails = activities?.filter((a) => a.type === "email") || [];
  const meetings =
    activities?.filter((a) => a.type === "meeting" || a.type === "call") || [];
  const notes = activities?.filter((a) => a.type === "note") || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/clients">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Client Details</h1>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column: Info & Quick Stats */}
        <div className="space-y-6 xl:col-span-1">
          <ClientInfoCard client={client} />
          <ClientNotesCard notes={notes} />
          <ClientTasksCard tasks={tasks || []} clientId={id} />
        </div>

        {/* Right Column: Main Content */}
        <div className="space-y-6 xl:col-span-2">
          <ClientProjectsCard projects={projects || []} clientId={id} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ClientMeetingsCard meetings={meetings} />
            <ClientEmailsCard emails={emails} clientId={id} />
          </div>
        </div>
      </div>
    </div>
  );
}
