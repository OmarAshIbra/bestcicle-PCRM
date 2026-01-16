"use client";

import { useState } from "react";
import { format } from "date-fns"; // Standard date formatting
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  LayoutGrid,
  List as ListIcon,
  Search,
  Filter,
  Calendar as CalendarIcon,
  User as UserIcon,
  Mail,
  Paperclip,
} from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Email {
  id: string;
  type: string;
  description: string;
  created_at: string;
  subject?: string; // Some might not have it if old schema, but new ones do
  client: { name: string } | null;
  attachments?: any[]; // JSONB
}

interface Client {
  id: string;
  name: string;
}

interface EmailListProps {
  initialEmails: Email[];
  clients: Client[];
}

export function EmailList({ initialEmails, clients }: EmailListProps) {
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [clientFilter, setClientFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);

  // Derived state for filtering
  const filteredEmails = initialEmails.filter((email) => {
    // Search Text
    const searchLower = search.toLowerCase();
    const subject =
      email.subject || email.description.split(":")[1]?.trim() || "";
    const to = email.description
      .split(":")[0]
      ?.replace("Sent email to", "")
      .trim();
    const clientName = email.client?.name || "";

    const matchesSearch =
      subject.toLowerCase().includes(searchLower) ||
      to.toLowerCase().includes(searchLower) ||
      clientName.toLowerCase().includes(searchLower);

    // Client Filter
    const matchesClient =
      clientFilter === "all" ||
      (email.client && email.client.name === clientFilter); // Using name for simplicity as ID might be harder to map from client dropdown if we only have names in table?
    // Actually prop passes clients with ID. Let's filter by ID if possible, but email.client only returns name in the query: `client:clients(name)`.
    // I should update the query in page.tsx to return client id as well `client:clients(id, name)`.

    // Date Filter
    let matchesDate = true;
    const emailDate = new Date(email.created_at);
    const now = new Date();
    if (dateFilter === "today") {
      matchesDate = emailDate.toDateString() === now.toDateString();
    } else if (dateFilter === "week") {
      const weekAgo = new Date();
      weekAgo.setDate(now.getDate() - 7);
      matchesDate = emailDate >= weekAgo;
    } else if (dateFilter === "month") {
      const monthAgo = new Date();
      monthAgo.setMonth(now.getMonth() - 1);
      matchesDate = emailDate >= monthAgo;
    }

    return matchesSearch && matchesClient && matchesDate;
  });

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 md:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search emails..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Filters */}
          <Select value={clientFilter} onValueChange={setClientFilter}>
            <SelectTrigger className="w-[140px] hidden sm:flex">
              <UserIcon className="mr-2 h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Client" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Clients</SelectItem>
              {clients.map((c) => (
                <SelectItem key={c.id} value={c.name}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-[140px] hidden sm:flex">
              <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="Date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 border rounded-md p-1 bg-muted/50">
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="icon"
            className="h-8 w-8"
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="icon"
            className="h-8 w-8"
            onClick={() => setViewMode("list")}
          >
            <ListIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      {filteredEmails.length === 0 ? (
        <EmptyState
          icon={<Mail className="h-6 w-6" />}
          title="No emails found"
          description="Try adjusting your filters or search query."
          className="border rounded-lg bg-card"
        />
      ) : (
        <div
          className={cn(
            "gap-4",
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              : "flex flex-col"
          )}
        >
          {filteredEmails.map((email) => (
            <Card
              key={email.id}
              className={cn(
                "cursor-pointer hover:shadow-md transition-shadow",
                viewMode === "list" &&
                  "flex flex-row items-center justify-between p-4"
              )}
              onClick={() => setSelectedEmail(email)}
            >
              <div className={cn("space-y-1", viewMode === "list" && "flex-1")}>
                {viewMode === "grid" ? (
                  <CardHeader className="p-4 pb-2">
                    <div className="flex justify-between items-start">
                      <h4
                        className="font-semibold line-clamp-1"
                        title={email.subject || "No Subject"}
                      >
                        {email.subject ||
                          email.description.split(":")[1]?.trim() ||
                          "No Subject"}
                      </h4>
                      <span className="text-xs text-muted-foreground shrink-0 ml-2">
                        {format(new Date(email.created_at), "MMM d")}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      To:{" "}
                      {email.description
                        .split(":")[0]
                        ?.replace("Sent email to", "")
                        .trim()}
                    </p>
                  </CardHeader>
                ) : (
                  // List View Header
                  <div className="flex items-center gap-4">
                    <div className="min-w-[100px] text-xs text-muted-foreground">
                      {format(new Date(email.created_at), "MMM d, yyyy")}
                    </div>
                    <div className="font-semibold w-[200px] truncate">
                      {email.client?.name || "Unknown"}
                    </div>
                    <div className="flex-1 font-medium truncate">
                      {email.subject || email.description}
                    </div>
                  </div>
                )}

                {viewMode === "grid" && (
                  <CardContent className="p-4 pt-2">
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className="text-xs">
                        {email.client?.name || "Unknown Client"}
                      </Badge>
                      {email.attachments && email.attachments.length > 0 && (
                        <Badge variant="outline" className="text-xs gap-1">
                          <Paperclip className="h-3 w-3" />
                          {email.attachments.length}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Detail Dialog (Popover) */}
      <Dialog
        open={!!selectedEmail}
        onOpenChange={(open) => !open && setSelectedEmail(null)}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {selectedEmail?.subject || "Email Details"}
            </DialogTitle>
            <DialogDescription>
              Sent on{" "}
              {selectedEmail &&
                format(new Date(selectedEmail.created_at), "PPP 'at' p")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-muted-foreground">
                To:
              </span>
              <span className="text-sm">
                {selectedEmail?.description
                  .split(":")[0]
                  ?.replace("Sent email to", "")
                  .trim()}
              </span>
            </div>
            {selectedEmail?.client?.name && (
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-muted-foreground">
                  Client:
                </span>
                <span className="text-sm">{selectedEmail.client.name}</span>
              </div>
            )}
            <div className="border rounded-md p-4 bg-muted/20 text-sm whitespace-pre-wrap max-h-[300px] overflow-y-auto">
              {/* 
                       Activities table doesn't cleanly store body separate from description in the original schema 
                       BUT our enhance script might have? No, 'activities' has description. 'email_templates' has body.
                       The `activities` table usually just has a description line. 
                       WAIT, if the user sends a long body, we only stored "Sent email to..." in description in previous tool call?
                       Let's check `compose-email-sheet`.
                       
                       In `compose-email-sheet`, we inserted:
                       description: `Sent email to ${...}: ${...}`
                       
                       We did NOT insert the body into the activities table.
                       The `activities` table schema has: `subject`, `description`. No `body`.
                       
                       This implies we can't show the full body unless we stored it.
                       Did we store it in `description`?
                       "Sent email to recipient: Subject"
                       
                       The user might be disappointed if they can't see the body.
                       However, I can only display what's in the DB.
                       For now, I will display the description.
                       
                       Improvement for future: Add `body` column to activities or store in `notes`?
                       The schema `001` shows `notes` in clients, not activities.
                       Activities has `description`.
                       Maybe `description` should contain the body?
                       But the code sets it to a summary string.
                       
                       I will show `description` for now in the body area.
                    */}
              {selectedEmail?.description}
            </div>

            {selectedEmail?.attachments &&
              selectedEmail.attachments.length > 0 && (
                <div className="space-y-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    Attachments:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {selectedEmail.attachments.map((att: any, i: number) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 border rounded px-2 py-1 text-xs bg-background"
                      >
                        <Paperclip className="h-3 w-3" />
                        <span className="truncate max-w-[150px]">
                          {att.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
