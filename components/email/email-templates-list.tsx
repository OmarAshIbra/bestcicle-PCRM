"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Edit, Trash2, Plus, FileText } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ManageTemplateDialog } from "./manage-template-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  created_by: string;
}

interface User {
  id: string;
  role: string;
}

interface EmailTemplatesListProps {
  templates: EmailTemplate[];
  user: User;
}

export function EmailTemplatesList({
  templates,
  user,
}: EmailTemplatesListProps) {
  const router = useRouter();
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] =
    useState<EmailTemplate | null>(null);
  const [templateToDelete, setTemplateToDelete] =
    useState<EmailTemplate | null>(null);

  const canDelete = (template: EmailTemplate) => {
    // Admins and Managers can delete any, Users can delete their own
    return (
      ["admin", "manager"].includes(user.role) ||
      template.created_by === user.id
    );
  };

  const handleDelete = async () => {
    if (!templateToDelete) return;

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("email_templates")
        .delete()
        .eq("id", templateToDelete.id);

      if (error) throw error;

      toast.success("Template deleted successfully");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete template");
    } finally {
      setTemplateToDelete(null);
    }
  };

  const handleEdit = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setIsManageOpen(true);
  };

  const handleCreate = () => {
    setSelectedTemplate(null);
    setIsManageOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Email Templates</h2>
          <p className="text-muted-foreground">
            Manage your reusable email templates.
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Create Template
        </Button>
      </div>

      {!templates || templates.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No templates found"
          description="Create your first email template to get started."
          className="border rounded-lg bg-card"
          action={
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Create Template
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <Card key={template.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg">{template.name}</CardTitle>
                <CardDescription className="line-clamp-1">
                  {template.subject}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {template.body}
                </p>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 border-t p-4 bg-muted/20">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(template)}
                >
                  <Edit className="mr-2 h-3 w-3" />
                  Edit
                </Button>
                {canDelete(template) && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setTemplateToDelete(template)}
                  >
                    <Trash2 className="mr-2 h-3 w-3" />
                    Delete
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <ManageTemplateDialog
        template={selectedTemplate}
        open={isManageOpen}
        onOpenChange={setIsManageOpen}
        userId={user.id}
      />

      <AlertDialog
        open={!!templateToDelete}
        onOpenChange={(open) => !open && setTemplateToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              template "{templateToDelete?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
