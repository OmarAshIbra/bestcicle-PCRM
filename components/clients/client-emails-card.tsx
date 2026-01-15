"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Plus, ExternalLink } from "lucide-react";
import { EmptyState } from "@/components/ui/empty";
import { format, parseISO } from "date-fns";
import Link from "next/link";

interface Email {
  id: string;
  subject: string;
  description?: string; // In current schema description stores body or summary
  created_at: string;
  status: string;
}

interface ClientEmailsCardProps {
  emails: Email[];
  clientId: string;
}

export function ClientEmailsCard({ emails, clientId }: ClientEmailsCardProps) {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Emails
          </CardTitle>
          <CardDescription>{emails.length} sent</CardDescription>
        </div>
        <Button size="sm" variant="outline" className="h-8" asChild>
          <Link href={`/email?client=${clientId}`}>
            <Plus className="h-3 w-3 sm:mr-2" />
            <span className="hidden sm:inline">Compose</span>
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="mt-4">
        {emails.length === 0 ? (
          <EmptyState
            icon={Mail}
            title="No emails sent"
            description="Start a conversation with this client."
            className="py-8"
          />
        ) : (
          <div className="space-y-4">
            {emails.slice(0, 5).map((email) => (
              <div
                key={email.id}
                className="group flex flex-col gap-1 border-b pb-3 last:border-0 last:pb-0"
              >
                <div className="flex items-center justify-between">
                  <h5 className="font-medium text-sm truncate pr-4">
                    {email.subject}
                  </h5>
                  <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                    {format(parseISO(email.created_at), "MMM d")}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {email.description}
                </p>
                <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs"
                    asChild
                  >
                    <Link href={`/activities/${email.id}`}>
                      View <ExternalLink className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
            {emails.length > 5 && (
              <Button
                variant="link"
                className="w-full h-auto p-0 text-xs"
                asChild
              >
                <Link href={`/clients/${clientId}/activities?type=email`}>
                  View all {emails.length} emails
                </Link>
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
