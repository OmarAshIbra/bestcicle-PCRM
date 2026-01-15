"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckSquare, Plus, AlertCircle } from "lucide-react";
import { EmptyState } from "@/components/ui/empty";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";

interface Task {
  id: string;
  title: string; // schema says title
  status: string;
  priority: string;
  due_date: string | null;
}

interface ClientTasksCardProps {
  tasks: Task[];
  clientId: string;
}

export function ClientTasksCard({ tasks, clientId }: ClientTasksCardProps) {
  const priorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive";
      case "medium":
        return "default"; // was warning/orange but default is black, let's use outline or secondary? Actually default is fine or custom class.
      default:
        return "secondary";
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <CheckSquare className="h-4 w-4" />
            Tasks
          </CardTitle>
          <CardDescription>
            {tasks.filter((t) => t.status !== "done").length} pending
          </CardDescription>
        </div>
        <Button size="sm" variant="outline" className="h-8" asChild>
          <Link href={`/tasks/new?client=${clientId}`}>
            <Plus className="h-3 w-3 sm:mr-2" />
            <span className="hidden sm:inline">Add Task</span>
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="mt-4">
        {tasks.length === 0 ? (
          <EmptyState
            icon={CheckSquare}
            title="No tasks"
            description="Create tasks to track action items."
            className="py-8"
          />
        ) : (
          <div className="space-y-3">
            {tasks.slice(0, 5).map((task) => (
              <div key={task.id} className="flex items-start gap-2 group">
                <Checkbox
                  id={`task-${task.id}`}
                  checked={task.status === "done"}
                  className="mt-1"
                />
                <div className="grid gap-1 flex-1">
                  <label
                    htmlFor={`task-${task.id}`}
                    className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
                      task.status === "done"
                        ? "line-through text-muted-foreground"
                        : ""
                    }`}
                  >
                    {task.title}
                  </label>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={priorityColor(task.priority) as any}
                      className="text-[10px] px-1 h-5 capitalize"
                    >
                      {task.priority}
                    </Badge>
                    {task.due_date && (
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Due {new Date(task.due_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {tasks.length > 5 && (
              <Button variant="link" className="w-full text-xs" asChild>
                <Link href={`/tasks?client=${clientId}`}>View all tasks</Link>
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
