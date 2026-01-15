import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Mail } from "lucide-react";
import { ComposeEmailSheet } from "@/components/email/compose-email-sheet";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmailTemplatesList } from "@/components/email/email-templates-list";

export default async function EmailPage() {
  const user = await requireAuth();
  const supabase = await createClient();

  // Fetch recent emails (activities of type 'email')
  const { data: emails } = await supabase
    .from("activities")
    .select("*, client:clients(name)")
    .eq("type", "email")
    .order("created_at", { ascending: false })
    .limit(50);

  // Fetch email templates
  const { data: templates } = await supabase
    .from("email_templates")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Email</h1>
          <p className="text-muted-foreground">
            Manage your communications and templates
          </p>
        </div>
        <ComposeEmailSheet
          trigger={
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Compose Email
            </Button>
          }
        />
      </div>

      <Tabs defaultValue="sent" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sent">Sent Emails</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="sent" className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search emails..." className="pl-9" />
            </div>
          </div>

          <div className="space-y-4">
            {!emails || emails.length === 0 ? (
              <EmptyState
                icon={Mail}
                title="No emails sent"
                description="Compose your first email to get started."
                className="border rounded-lg bg-card"
              />
            ) : (
              <div className="grid gap-4">
                {emails.map((email) => (
                  <Card key={email.id}>
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h4 className="font-semibold">
                            {email.description.split(":")[1]?.trim() ||
                              "No Subject"}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            To:{" "}
                            {email.description
                              .split(":")[0]
                              ?.replace("Sent email to", "")
                              .trim()}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(email.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-2">
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {email.client?.name || "Unknown Client"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="templates">
          <EmailTemplatesList templates={templates || []} user={user} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
