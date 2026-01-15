import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ProjectForm } from "@/components/projects/project-form";

export default async function NewProjectPage() {
  const user = await requireAuth();
  const supabase = await createClient();

  // Fetch clients for dropdown
  const { data: clients } = await supabase
    .from("clients")
    .select("id, name")
    .order("name");

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create Project</h1>
        <p className="text-muted-foreground">
          Start a new project for a client
        </p>
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
        <ProjectForm
          clients={clients || []}
          userRole={user.role}
          userId={user.id}
        />
      </div>
    </div>
  );
}
