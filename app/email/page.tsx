import { requireAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ComposeEmailSheet } from "@/components/email/compose-email-sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmailTemplatesList } from "@/components/email/email-templates-list";
import { EmailList } from "@/components/email/email-list";

export default async function EmailPage() {
  const user = await requireAuth();
  const supabase = await createClient();

  // Fetch recent emails (activities of type 'email')
  const { data: emails } = await supabase
    .from("activities")
    .select("*, client:clients(id, name)") // Fetch Name AND ID for filtering
    .eq("type", "email")
    .order("created_at", { ascending: false })
    .limit(50);

  // Fetch clients for filter
  const { data: clients } = await supabase
    .from("clients")
    .select("id, name")
    .order("name");

  // Fetch email templates
  const { data: templates } = await supabase
    .from("email_templates")
    .select("*, created_by: users(full_name, id)")
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
          <EmailList initialEmails={emails || []} clients={clients || []} />
        </TabsContent>

        <TabsContent value="templates">
          <EmailTemplatesList templates={templates || []} user={user} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
