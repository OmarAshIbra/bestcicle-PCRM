"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollText, Plus, FileText } from "lucide-react";
import { EmptyState } from "@/components/ui/empty";
import { format, parseISO } from "date-fns";

interface Note {
  id: string;
  subject: string; // Notes usually don't have subject in simple schema, but activity table has subject.
  description?: string;
  created_at: string;
}

interface ClientNotesCardProps {
  notes: Note[];
}

export function ClientNotesCard({ notes }: ClientNotesCardProps) {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <ScrollText className="h-4 w-4" />
            Notes
          </CardTitle>
          <CardDescription>{notes.length} notes</CardDescription>
        </div>
        <Button size="sm" variant="outline" className="h-8">
          <Plus className="h-3 w-3 sm:mr-2" />
          <span className="hidden sm:inline">Add Note</span>
        </Button>
      </CardHeader>
      <CardContent className="mt-4">
        {notes.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No notes"
            description="Add notes to keep track of important details."
            className="py-8"
          />
        ) : (
          <div className="space-y-4">
            {notes.slice(0, 5).map((note) => (
              <div key={note.id} className="rounded-lg bg-muted/50 p-3 text-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">{note.subject}</span>
                  <span className="text-xs text-muted-foreground">
                    {format(parseISO(note.created_at), "MMM d, yyyy")}
                  </span>
                </div>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {note.description}
                </p>
              </div>
            ))}
            {notes.length > 5 && (
              <Button variant="link" className="w-full text-xs">
                View all notes
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
