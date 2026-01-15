"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MoreHorizontal, Plus } from "lucide-react";
import { TaskFormDialog } from "@/components/tasks/task-form-dialog";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface TaskKanbanProps {
  tasks: any[];
  projectId: string;
  projectMembers: any[];
  userId: string;
}

const COLUMNS = [
  { id: "todo", title: "To Do" },
  { id: "in_progress", title: "In Progress" },
  { id: "done", title: "Done" },
];

export function TaskKanban({
  tasks,
  projectId,
  projectMembers,
  userId,
}: TaskKanbanProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any | null>(null);
  const router = useRouter();
  const supabase = createClient();

  // Group tasks by status
  const tasksByStatus = tasks.reduce((acc, task) => {
    const status = task.status === "cancelled" ? "todo" : task.status; // Map cancelled to todo or ignore? Let's keep distinct columns if needed, but for simple Kanban 3 cols.
    // If status not in COLUMNS, maybe 'todo'?
    const columnId = ["todo", "in_progress", "done"].includes(status)
      ? status
      : "todo";
    if (!acc[columnId]) acc[columnId] = [];
    acc[columnId].push(task);
    return acc;
  }, {} as Record<string, any[]>);

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("tasks")
        .update({ status: newStatus })
        .eq("id", taskId);
      if (error) throw error;
      toast.success("Task updated");
      router.refresh();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  // Simple drag simulation by just having "Move to next" buttons or clicking to edit.
  // For MVP without dnd library, clicking a task opens edit dialog where status can be changed.

  return (
    <div className="h-full">
      <div className="flex justify-end mb-4">
        <Button onClick={() => setIsCreateOpen(true)} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full min-h-[500px]">
        {COLUMNS.map((column) => (
          <div
            key={column.id}
            className="flex flex-col h-full rounded-lg bg-muted/30 border"
          >
            <div className="p-4 border-b bg-muted/40 font-semibold flex items-center justify-between">
              {column.title}
              <Badge variant="secondary" className="ml-2">
                {tasksByStatus[column.id]?.length || 0}
              </Badge>
            </div>
            <div className="p-4 flex-1 space-y-3 overflow-y-auto">
              {tasksByStatus[column.id]?.map((task) => (
                <Card
                  key={task.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setEditingTask(task)}
                >
                  <CardContent className="p-3 space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-medium leading-tight">
                        {task.title}
                      </span>
                      <Badge
                        variant={
                          task.priority === "high" ? "destructive" : "secondary"
                        }
                        className="text-[10px] h-5 px-1 py-0 capitalize"
                      >
                        {task.priority}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                      <span>
                        {task.due_date
                          ? new Date(task.due_date).toLocaleDateString()
                          : ""}
                      </span>
                      {task.assigned_to_user && (
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={task.assigned_to_user.avatar_url} />
                          <AvatarFallback className="text-[9px]">
                            {task.assigned_to_user.full_name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      <TaskFormDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        projectId={projectId}
        projectMembers={projectMembers}
        userId={userId}
      />

      {editingTask && (
        <TaskFormDialog
          open={!!editingTask}
          onOpenChange={(open) => !open && setEditingTask(null)}
          projectId={projectId}
          task={editingTask}
          projectMembers={projectMembers}
          userId={userId}
        />
      )}
    </div>
  );
}
