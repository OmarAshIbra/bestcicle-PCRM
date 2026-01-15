"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  CheckSquare,
  MoreHorizontal,
  Pencil,
  Trash,
  Calendar,
  AlertCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TaskFormDialog } from "@/components/tasks/task-form-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { format, parseISO } from "date-fns";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface TaskListViewProps {
  tasks: any[];
  projectId: string;
  projectMembers: any[];
  userId: string;
  userRole: string;
}

export function TaskListView({
  tasks,
  projectId,
  projectMembers,
  userId,
  userRole,
}: TaskListViewProps) {
  const [editingTask, setEditingTask] = useState<any | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleDelete = async (taskId: string) => {
    try {
      const { error } = await supabase.from("tasks").delete().eq("id", taskId);
      if (error) throw error;
      toast.success("Task deleted");
      router.refresh();
    } catch (error) {
      toast.error("Failed to delete task");
    }
  };

  const priorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive";
      case "medium":
        return "default";
      default:
        return "secondary";
    }
  };

  const statusBadgeVariant = (status: string) => {
    switch (status) {
      case "done":
        return "outline";
      case "in_progress":
        return "default";
      default:
        return "secondary";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setIsCreateOpen(true)}>
          <CheckSquare className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </div>

      {tasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="No tasks yet"
          description="Create a task to get started."
        />
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`mt-1 h-2 w-2 rounded-full ${
                    task.priority === "high"
                      ? "bg-destructive"
                      : task.priority === "medium"
                      ? "bg-orange-500"
                      : "bg-slate-500"
                  }`}
                />
                <div>
                  <h4
                    className={`font-medium ${
                      task.status === "done"
                        ? "line-through text-muted-foreground"
                        : ""
                    }`}
                  >
                    {task.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <Badge
                      variant={statusBadgeVariant(task.status) as any}
                      className="text-[10px] px-1 h-5 capitalize"
                    >
                      {task.status.replace("_", " ")}
                    </Badge>
                    {task.due_date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(parseISO(task.due_date), "MMM d")}
                      </span>
                    )}
                    {task.assigned_to_user && (
                      <span className="flex items-center gap-1">
                        <Avatar className="h-4 w-4">
                          <AvatarImage src={task.assigned_to_user.avatar_url} />
                          <AvatarFallback className="text-[9px]">
                            {task.assigned_to_user.full_name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        {task.assigned_to_user.full_name}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setEditingTask(task)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleDelete(task.id)}
                    className="text-destructive"
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      )}

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
