import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ProjectHeader } from "@/components/projects/project-header";
import { ProjectTeam } from "@/components/projects/project-team";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskListView } from "@/components/tasks/task-list-view";
import { TaskKanban } from "@/components/tasks/task-kanban";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireAuth();
  const supabase = await createClient();
  const { id } = await params;

  // Fetch project details
  const { data: project } = await supabase
    .from("projects")
    .select("*, client:clients(name, id)")
    .eq("id", id)
    .single();

  if (!project) {
    notFound();
  }

  // Fetch team members
  const { data: members } = await supabase
    .from("project_members")
    .select("*, user:users(full_name, email, avatar_url)")
    .eq("project_id", id);

  // Fetch tasks
  const { data: tasks } = await supabase
    .from("tasks")
    .select("*, assigned_to_user:users(full_name, avatar_url)")
    .eq("project_id", id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <ProjectHeader project={project} userRole={user.role} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="tasks" className="w-full">
            <TabsList>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="kanban">Kanban</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
            </TabsList>
            <TabsContent value="tasks" className="space-y-4 mt-4">
              <TaskListView
                tasks={tasks || []}
                projectId={id}
                projectMembers={members || []}
                userId={user.id}
                userRole={user.role}
              />
            </TabsContent>
            <TabsContent value="kanban" className="mt-4">
              <TaskKanban
                tasks={tasks || []}
                projectId={id}
                projectMembers={members || []}
                userId={user.id}
              />
            </TabsContent>
            <TabsContent value="timeline" className="mt-4">
              <div className="h-[400px] flex items-center justify-center border border-dashed rounded-lg bg-muted/20">
                Timeline View (Coming Soon)
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <ProjectTeam
            members={members || []}
            projectId={id}
            currentUserRole={user.role}
          />
        </div>
      </div>
    </div>
  );
}
