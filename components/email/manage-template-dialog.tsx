"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
}

interface ManageTemplateDialogProps {
  template?: EmailTemplate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
}

export function ManageTemplateDialog({
  template,
  open,
  onOpenChange,
  userId,
}: ManageTemplateDialogProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => {
    if (template) {
      setName(template.name);
      setSubject(template.subject);
      setBody(template.body);
    } else {
      setName("");
      setSubject("");
      setBody("");
    }
  }, [template, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const supabase = createClient();
      let error;

      if (template) {
        // Update
        const { error: updateError } = await supabase
          .from("email_templates")
          .update({ name, subject, body })
          .eq("id", template.id);
        error = updateError;
      } else {
        // Create
        const { error: insertError } = await supabase
          .from("email_templates")
          .insert({
            name,
            subject,
            body,
            created_by: userId,
          });
        error = insertError;
      }

      if (error) throw error;

      toast.success(
        template
          ? "Template updated successfully"
          : "Template created successfully"
      );
      router.refresh();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error(
        template ? "Failed to update template" : "Failed to create template"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {template ? "Edit Template" : "Create Template"}
          </DialogTitle>
          <DialogDescription>
            {template
              ? "Make changes to your email template here."
              : "Create a new email template to use in your campaigns."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Template Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Welcome Email"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="subject">Subject Line</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., Welcome to our platform!"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="body">Email Body</Label>
              <Textarea
                id="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Hi {{client_name}}, ..."
                className="min-h-[200px]"
                required
              />
              <p className="text-xs text-muted-foreground">
                Supported variables: {"{{client_name}}"}, {"{{user_name}}"},{" "}
                {"{{company}}"}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {template ? "Save Changes" : "Create Template"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
