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
  client_id: string;
  purpose?: string;
  subject: string;
  body: string;
  got_response: boolean;
  response_body?: string | null;
  parent_email_id?: string | null;
  sent_at: string;
  updated_at: string;
  client: { id: string; name: string; email: string } | null;
  created_by?: { full_name: string; id: string };
  child_emails?: Email[];
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
  console.log(clients);

  // Derived state for filtering
  const filteredEmails = initialEmails.filter((email) => {
    // Search Text
    const searchLower = search.toLowerCase();
    const subject = email.subject || email.body.split(":")[1]?.trim() || "";
    const to = email.body.split(":")[0]?.replace("Sent email to", "").trim();
    const clientName = email.client?.name || "";

    const matchesSearch =
      subject.toLowerCase().includes(searchLower) ||
      to.toLowerCase().includes(searchLower) ||
      clientName.toLowerCase().includes(searchLower);

    // Client Filter
    const matchesClient =
      clientFilter === "all" ||
      (email.client && email.client.name === clientFilter);

    // Date Filter
    let matchesDate = true;
    const emailDate = new Date(email.sent_at);
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
        {/* show number of emails */}
        <div className="flex items-center gap-1" title="Number of emails">
          <p className="text-sm text-foreground/60"> {initialEmails.length}</p>
          <Mail className="h-4 w-4 text-muted-foreground" />
        </div>
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
                          email.body.split(":")[1]?.trim() ||
                          "No Subject"}
                      </h4>
                      <span className="text-xs text-muted-foreground shrink-0 ml-2">
                        {format(new Date(email.sent_at), "MMM d")}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      To:{" "}
                      {email.body
                        .split(":")[0]
                        ?.replace("Sent email to", "")
                        .trim()}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <UserIcon className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {email.created_by?.full_name || "Unknown"}
                      </span>
                    </div>
                  </CardHeader>
                ) : (
                  // List View Header
                  <div className="flex items-center gap-4">
                    <div className="min-w-[100px] text-xs text-muted-foreground">
                      {format(new Date(email.sent_at), "MMM d, yyyy")}
                    </div>
                    <div className="font-semibold w-[200px] truncate">
                      {email.client?.name || "Unknown"}
                    </div>
                    <div className="flex-1 font-medium truncate">
                      {email.subject || email.body}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground min-w-[120px]">
                      <UserIcon className="h-3 w-3" />
                      <span className="truncate">
                        {email.created_by?.full_name || "Unknown"}
                      </span>
                    </div>
                  </div>
                )}

                {viewMode === "grid" && (
                  <CardContent className="p-4 pt-2">
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className="text-xs">
                        {email.client?.name || "Unknown Client"}
                      </Badge>
                      {/* {email?.attachments && email.attachments.length > 0 && (
                        <Badge variant="outline" className="text-xs gap-1">
                          <Paperclip className="h-3 w-3" />
                          {email.attachments.length}
                        </Badge>
                      )} */}
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
        <DialogContent className="sm:max-w-[700px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {selectedEmail?.subject || "Email Details"}
            </DialogTitle>
            <DialogDescription>
              Sent on{" "}
              {selectedEmail &&
                format(new Date(selectedEmail.sent_at), "PPP 'at' p")}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
            <div className="space-y-6 py-4">
              {/* Email Metadata */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-muted-foreground uppercase">
                    Client
                  </span>
                  <span className="text-sm font-medium">
                    {selectedEmail?.client?.name || "Unknown"}
                  </span>
                  {selectedEmail?.client?.email && (
                    <span className="text-xs text-muted-foreground">
                      {selectedEmail.client.email}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-muted-foreground uppercase">
                    Sent By
                  </span>
                  <div className="flex items-center gap-2">
                    <UserIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {selectedEmail?.created_by?.full_name || "Unknown"}
                    </span>
                  </div>
                </div>
              </div>
              {selectedEmail?.purpose && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground uppercase">
                    Purpose:
                  </span>
                  <Badge variant="secondary" className="capitalize">
                    {selectedEmail.purpose.replace("_", " ")}
                  </Badge>
                </div>
              )}

              {/* Email Body */}
              <div className="space-y-2">
                <span className="text-xs font-medium text-muted-foreground uppercase">
                  Message
                </span>
                <div className="border rounded-md p-4 bg-muted/20 text-sm whitespace-pre-wrap">
                  {selectedEmail?.body}
                </div>
              </div>

              {/* Response Status */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground uppercase">
                  Response Status:
                </span>
                <Badge
                  variant={selectedEmail?.got_response ? "default" : "outline"}
                >
                  {selectedEmail?.got_response ? "Received" : "No Response"}
                </Badge>
              </div>

              {/* Response Body if exists */}
              {selectedEmail?.response_body && (
                <div className="space-y-2">
                  <span className="text-xs font-medium text-muted-foreground uppercase">
                    Response
                  </span>
                  <div className="border rounded-md p-4 bg-green-50 dark:bg-green-950/20 text-sm whitespace-pre-wrap">
                    {selectedEmail.response_body}
                  </div>
                </div>
              )}

              {/* Child Emails (Follow-ups) */}
              {selectedEmail?.child_emails &&
                selectedEmail.child_emails.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-muted-foreground uppercase">
                        Follow-up Emails
                      </span>
                      <Badge variant="outline">
                        {selectedEmail.child_emails.length}
                      </Badge>
                    </div>
                    <div className="space-y-3">
                      {selectedEmail.child_emails.map((childEmail, index) => (
                        <Card key={childEmail.id} className="bg-muted/30">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="space-y-1">
                                <CardTitle className="text-sm font-medium">
                                  {childEmail.subject}
                                </CardTitle>
                                <CardDescription className="text-xs">
                                  Sent on{" "}
                                  {format(
                                    new Date(childEmail.sent_at),
                                    "PPP 'at' p"
                                  )}
                                </CardDescription>
                              </div>
                              {childEmail.purpose && (
                                <Badge
                                  variant="secondary"
                                  className="text-xs capitalize"
                                >
                                  {childEmail.purpose.replace("_", " ")}
                                </Badge>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="text-sm text-muted-foreground whitespace-pre-wrap border-l-2 pl-3">
                              {childEmail.body}
                            </div>
                            {childEmail.got_response && (
                              <div className="flex items-center gap-2">
                                <Badge variant="default" className="text-xs">
                                  Response Received
                                </Badge>
                              </div>
                            )}
                            {childEmail.response_body && (
                              <div className="mt-2 p-3 bg-background rounded-md border text-xs">
                                <div className="font-medium mb-1">
                                  Response:
                                </div>
                                <div className="text-muted-foreground whitespace-pre-wrap">
                                  {childEmail.response_body}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

              {/* Additional Metadata */}
              <div className="pt-4 border-t space-y-2">
                {selectedEmail?.updated_at &&
                  selectedEmail.updated_at !== selectedEmail.sent_at && (
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Last Updated:</span>
                      <span>
                        {format(
                          new Date(selectedEmail.updated_at),
                          "PPP 'at' p"
                        )}
                      </span>
                    </div>
                  )}
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
