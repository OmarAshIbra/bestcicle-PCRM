"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Video,
  Phone,
  Users,
} from "lucide-react";
import { EmptyState } from "@/components/ui/empty";
import { format, isAfter, isBefore, parseISO } from "date-fns";

interface Meeting {
  id: string;
  subject: string;
  description?: string;
  scheduled_at: string;
  status: string;
  type: string;
}

interface ClientMeetingsCardProps {
  meetings: Meeting[];
}

export function ClientMeetingsCard({ meetings }: ClientMeetingsCardProps) {
  const [filter, setFilter] = useState<"upcoming" | "past" | "all">("upcoming");

  const now = new Date();

  const upcomingMeetings = meetings.filter(
    (m) => m.scheduled_at && isAfter(parseISO(m.scheduled_at), now)
  );
  const pastMeetings = meetings.filter(
    (m) => m.scheduled_at && isBefore(parseISO(m.scheduled_at), now)
  );

  const displayedMeetings =
    filter === "all"
      ? meetings
      : filter === "upcoming"
      ? upcomingMeetings
      : pastMeetings;

  const getIcon = (type: string) => {
    switch (type) {
      case "call":
        return <Phone className="h-4 w-4" />;
      case "meeting":
        return <Users className="h-4 w-4" />;
      default:
        return <Video className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            Meetings
          </CardTitle>
          <CardDescription>{upcomingMeetings.length} upcoming</CardDescription>
        </div>
        <Button size="sm" variant="outline" className="h-8">
          <Plus className="h-3 w-3 sm:mr-2" />
          <span className="hidden sm:inline">Schedule</span>
        </Button>
      </CardHeader>
      <CardContent className="mt-4">
        <Tabs
          defaultValue="upcoming"
          value={filter}
          onValueChange={(v) => setFilter(v as any)}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>

          <TabsContent value={filter} className="space-y-4">
            {displayedMeetings.length === 0 ? (
              <EmptyState
                icon={CalendarIcon}
                title="No meetings found"
                description={`No ${filter} meetings scheduled.`}
                className="py-8"
              />
            ) : (
              displayedMeetings.map((meeting) => (
                <div
                  key={meeting.id}
                  className="flex items-start gap-4 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-background text-muted-foreground">
                    {getIcon(meeting.type)}
                  </div>
                  <div className="grid gap-1 flex-1">
                    <div className="flex items-center justify-between">
                      <h5 className="font-semibold text-sm">
                        {meeting.subject}
                      </h5>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {meeting.scheduled_at
                          ? format(
                              parseISO(meeting.scheduled_at),
                              "MMM d, h:mm a"
                            )
                          : "Unscheduled"}
                      </span>
                    </div>
                    {meeting.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {meeting.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant={
                          meeting.status === "completed"
                            ? "secondary"
                            : "default"
                        }
                        className="text-[10px] px-1 h-5 capitalize"
                      >
                        {meeting.status}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground capitalize flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {meeting.type}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
