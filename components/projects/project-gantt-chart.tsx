"use client";

import { useMemo } from "react";
import {
  addDays,
  differenceInDays,
  format,
  startOfWeek,
  endOfWeek,
  isWithinInterval,
} from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface Task {
  id: string;
  title: string;
  status: string;
  created_at: string;
  due_date?: string | null;
  start_date?: string | null; // Assuming tasks might have a start date, if not use created_at
}

interface ProjectGanttChartProps {
  tasks: Task[];
}

export function ProjectGanttChart({ tasks }: ProjectGanttChartProps) {
  // Determine date range
  const { startDate, endDate, daysJson } = useMemo(() => {
    if (tasks.length === 0) {
      const start = startOfWeek(new Date());
      const end = endOfWeek(new Date());
      return { startDate: start, endDate: end, daysJson: [] };
    }

    // specific logic: Find min start (or created_at) and max due_date
    const dates = tasks.flatMap((t) => [
      new Date(t.created_at),
      t.due_date ? new Date(t.due_date) : addDays(new Date(t.created_at), 7), // Default 1 week if no due date
    ]);

    // Add buffer
    const minDate = new Date(Math.min(...dates.map((d) => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())));

    const start = startOfWeek(minDate);
    const end = endOfWeek(addDays(maxDate, 7)); // Add a week buffer

    const days = [];
    let current = start;
    while (current <= end) {
      days.push(current);
      current = addDays(current, 1);
    }

    return { startDate: start, endDate: end, daysJson: days };
  }, [tasks]);

  const getTaskPosition = (task: Task) => {
    const taskStart = new Date(task.created_at);
    // specific business logic: if no due date, assume 3 days duration for visual
    const taskEnd = task.due_date
      ? new Date(task.due_date)
      : addDays(taskStart, 3);

    const offsetDays = differenceInDays(taskStart, startDate);
    const durationDays = differenceInDays(taskEnd, taskStart);

    // Ensure at least 1 day width
    const width = Math.max(1, durationDays);

    return {
      left: offsetDays * 40, // 40px per day column
      width: width * 40,
    };
  };

  if (tasks.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center border rounded-lg bg-muted/10 text-muted-foreground">
        No tasks to display
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle>Project Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="w-full whitespace-nowrap rounded-md border">
          <div
            className="relative"
            style={{ width: `${daysJson.length * 40}px` }}
          >
            {/* Header Row */}
            <div className="flex border-b h-10 sticky top-0 bg-background z-10">
              {daysJson.map((day, i) => (
                <div
                  key={i}
                  className="w-[40px] shrink-0 border-r flex flex-col items-center justify-center text-[10px] text-muted-foreground"
                >
                  <span className="font-bold">{format(day, "d")}</span>
                  <span>{format(day, "EE")}</span>
                </div>
              ))}
            </div>

            {/* Grid Lines */}
            <div className="absolute inset-0 top-10 pointer-events-none flex">
              {daysJson.map((_, i) => (
                <div
                  key={i}
                  className="w-[40px] shrink-0 border-r h-full opacity-20"
                />
              ))}
            </div>

            {/* Tasks */}
            <div className="py-4 space-y-4 min-h-[300px]">
              {tasks.map((task) => {
                const { left, width } = getTaskPosition(task);
                return (
                  <div
                    key={task.id}
                    className="relative h-8 group hover:bg-muted/10 transition-colors px-2"
                  >
                    <div
                      className="absolute top-1 h-6 rounded bg-primary/80 hover:bg-primary transition-all text-[10px] text-primary-foreground flex items-center px-2 truncate cursor-pointer shadow-sm"
                      style={{
                        left: `${left}px`,
                        width: `${width}px`,
                      }}
                      title={`${task.title} (${task.status})`}
                    >
                      {task.title}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
