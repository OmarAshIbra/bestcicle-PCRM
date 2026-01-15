"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LayoutGrid, List, Plus, Briefcase } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/ui/empty";

interface Project {
  id: string;
  name: string;
  status: string;
  priority: string;
  due_date: string;
  description?: string;
}

interface ClientProjectsCardProps {
  projects: Project[];
  clientId: string;
}

export function ClientProjectsCard({
  projects,
  clientId,
}: ClientProjectsCardProps) {
  const [view, setView] = useState<"grid" | "list">("grid");

  const statusColors: Record<
    string,
    "default" | "secondary" | "destructive" | "outline"
  > = {
    pending: "secondary",
    in_progress: "default",
    approved: "default",
    completed: "outline",
    rejected: "destructive",
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Projects
          </CardTitle>
          <CardDescription>
            {projects.length} active project{projects.length !== 1 && "s"}
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-md border p-1">
            <Button
              variant={view === "grid" ? "secondary" : "ghost"}
              size="icon"
              className="h-6 w-6"
              onClick={() => setView("grid")}
            >
              <LayoutGrid className="h-3 w-3" />
            </Button>
            <Button
              variant={view === "list" ? "secondary" : "ghost"}
              size="icon"
              className="h-6 w-6"
              onClick={() => setView("list")}
            >
              <List className="h-3 w-3" />
            </Button>
          </div>
          <Button size="sm" variant="outline" asChild>
            <Link href={`/projects/new?client=${clientId}`}>
              <Plus className="h-3 w-3 sm:mr-2" />
              <span className="hidden sm:inline">New</span>
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="mt-4">
        {projects.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No projects"
            description="No projects found for this client."
          />
        ) : view === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {projects.map((project) => (
              <Link href={`/projects/${project.id}`} key={project.id}>
                <div className="rounded-lg border p-3 hover:bg-muted/50 transition-colors h-full flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-sm truncate">
                        {project.name}
                      </h4>
                      <Badge
                        variant={statusColors[project.status] || "outline"}
                        className="text-[10px] px-1 h-5 capitalize"
                      >
                        {project.status.replace("_", " ")}
                      </Badge>
                    </div>
                    {project.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                        {project.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                    <span className="capitalize">
                      {project.priority} Priority
                    </span>
                    {project.due_date && (
                      <span>
                        Due {new Date(project.due_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {projects.map((project) => (
              <Link href={`/projects/${project.id}`} key={project.id}>
                <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <div className="flex flex-col gap-1 overflow-hidden">
                    <span className="font-medium text-sm truncate">
                      {project.name}
                    </span>
                    <span className="text-xs text-muted-foreground capitalize">
                      {project.priority} Priority • Due{" "}
                      {project.due_date
                        ? new Date(project.due_date).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                  <Badge
                    variant={statusColors[project.status] || "outline"}
                    className="capitalize shrink-0"
                  >
                    {project.status.replace("_", " ")}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
