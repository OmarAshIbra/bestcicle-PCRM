"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { Loader2, Send, FileText, Check, ChevronsUpDown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const emailSchema = z.object({
  recipient_email: z.string().email(),
  subject: z.string().min(1, "Subject is required"),
  body: z.string().min(1, "Body is required"),
  template_id: z.string().optional(),
  client_id: z.string().optional(),
});

interface ComposeEmailSheetProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export function ComposeEmailSheet({
  open,
  onOpenChange,
  trigger,
}: ComposeEmailSheetProps) {
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(open || false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingValues, setPendingValues] = useState<z.infer<
    typeof emailSchema
  > | null>(null);
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const supabase = createClient();

  const form = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      recipient_email: "",
      subject: "",
      body: "",
      template_id: "none",
      client_id: "",
    },
  });

  useEffect(() => {
    if (onOpenChange) {
      setIsOpen(open || false);
    }
  }, [open, onOpenChange]);

  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen);
    if (!newOpen) {
      setAttachments([]);
      form.reset();
      setShowConfirmDialog(false);
    }
    if (onOpenChange) onOpenChange(newOpen);
  };

  const [userName, setUserName] = useState("");

  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        const [templatesRes, clientsRes, userRes] = await Promise.all([
          supabase.from("email_templates").select("*"),
          supabase.from("clients").select("id, name, email, company"),
          supabase.auth.getUser(),
        ]);
        if (templatesRes.data) setTemplates(templatesRes.data);
        if (clientsRes.data) setClients(clientsRes.data);
        if (userRes.data.user) {
          // Try to get name from metadata or public table could be better but metadata is faster here
          setUserName(userRes.data.user.user_metadata?.full_name || "User");
        }
      };
      fetchData();
    }
  }, [isOpen]);

  const handleTemplateChange = (templateId: string) => {
    if (templateId === "none") return;
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      form.setValue("subject", template.subject);
      form.setValue("body", template.body);
    }
  };

  const handleClientSelect = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId);
    if (client && client.email) {
      form.setValue("recipient_email", client.email);
      form.setValue("client_id", client.id);
      setComboboxOpen(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments((prev) => [...prev, ...Array.from(e.target.files || [])]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const processVariables = (
    text: string,
    clientName: string,
    currentUserName: string
  ) => {
    if (!text) return "";
    return text
      .replace(/{{client_name}}/g, clientName)
      .replace(/{{user_name}}/g, currentUserName);
  };

  async function onPreSubmit(values: z.infer<typeof emailSchema>) {
    // 1. Resolve variables
    const selectedClientId = form.getValues("client_id");
    const client = clients.find((c) => c.id === selectedClientId);

    // Fallback: If no client selected but email matches one, use that
    const matchedClient =
      client || clients.find((c) => c.email === values.recipient_email);
    const clientName = matchedClient
      ? matchedClient.company || matchedClient.name
      : "Valued Client";

    const processedBody = processVariables(values.body, clientName, userName);
    const processedSubject = processVariables(
      values.subject,
      clientName,
      userName
    );

    // 2. Open Mailto (simulated attachment handling via link generally doesn't work well via mailto, ignoring for MVP mailto)
    // Basic mailto construction
    const mailtoLink = `mailto:${
      values.recipient_email
    }?subject=${encodeURIComponent(processedSubject)}&body=${encodeURIComponent(
      processedBody
    )}`;

    window.open(mailtoLink, "_blank");

    // 3. Store pending values and Show Confirmation
    setPendingValues({
      ...values,
      body: processedBody,
      subject: processedSubject,
    });
    setShowConfirmDialog(true);
  }

  async function handleConfirmSend() {
    if (!pendingValues) return;
    setLoading(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) throw new Error("Not authenticated");

      const attachmentData = attachments.map((file) => ({
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file),
      }));

      const clientId =
        pendingValues.client_id ||
        clients.find((c) => c.email === pendingValues.recipient_email)?.id;

      if (!clientId) {
        toast.warning(
          "Email sent, but activity not saved because recipient is not a registered client."
        );
      } else {
        const { error: insertError } = await supabase
          .from("activities")
          .insert({
            client_id: clientId,
            user_id: session.session.user.id,
            type: "email",
            subject: pendingValues.subject,
            description: `Sent email to ${pendingValues.recipient_email}: ${pendingValues.subject}`,
            status: "completed",
            created_by: session.session.user.id,
            completed_at: new Date().toISOString(),
            scheduled_at: new Date().toISOString(),
            attachments: attachmentData,
          });

        if (insertError) throw insertError;
        toast.success("Email activity logged successfully");
      }

      handleOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to log email");
    } finally {
      setLoading(false);
      setShowConfirmDialog(false);
      setPendingValues(null);
    }
  }

  return (
    <>
      <Sheet open={isOpen} onOpenChange={handleOpenChange}>
        {trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}
        <SheetContent className="sm:max-w-[540px] lg:max-w-[840px] overflow-y-auto pt-4 lg:p-6 lg:text-lg mt-4">
          <SheetHeader>
            <SheetTitle>Compose Email</SheetTitle>
            <SheetDescription>
              Send an email to a client or contact.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-2 p-4 lg:text-lg">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onPreSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="template_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Template (Optional)</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          handleTemplateChange(value);
                        }}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a template" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">No Template</SelectItem>
                          {templates.map((t) => (
                            <SelectItem key={t.id} value={t.id}>
                              {t.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="recipient_email"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>To</FormLabel>
                      <Popover
                        open={comboboxOpen}
                        onOpenChange={setComboboxOpen}
                      >
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "w-full justify-between pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value
                                ? field.value
                                : "Select client or type email"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[400px] p-0" align="start">
                          <Command>
                            <CommandInput placeholder="Search client..." />
                            <CommandList>
                              <CommandEmpty>No client found.</CommandEmpty>
                              <CommandGroup>
                                {clients.map((client) => (
                                  <CommandItem
                                    value={client.name + " " + client.email}
                                    key={client.id}
                                    onSelect={() =>
                                      handleClientSelect(client.id)
                                    }
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        client.email === field.value
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                    <div className="flex flex-col">
                                      <span>{client.name}</span>
                                      <span className="text-xs text-muted-foreground">
                                        {client.email}
                                      </span>
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <FormControl>
                        <Input placeholder="Project Update" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="body"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Write your message here... Use {{client_name}} for dynamic insertion."
                          className="min-h-[200px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <FormLabel>Attachments</FormLabel>
                  <div className="flex flex-wrap gap-2">
                    {attachments.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 bg-muted px-3 py-1 rounded-md text-sm"
                      >
                        <FileText className="h-4 w-4" />
                        <span className="max-w-[150px] truncate">
                          {file.name}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 text-muted-foreground hover:text-destructive"
                          onClick={() => removeAttachment(index)}
                        >
                          &times;
                        </Button>
                      </div>
                    ))}
                    <Input
                      type="file"
                      className="hidden"
                      id="file-upload"
                      multiple
                      onChange={handleFileChange}
                    />
                    <Button type="button" variant="outline" size="sm" asChild>
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <FileText className="mr-2 h-4 w-4" />
                        Attach
                      </label>
                    </Button>
                  </div>
                </div>

                <SheetFooter className="mt-4">
                  <Button type="submit" disabled={loading}>
                    {loading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    <Send className="mr-2 h-4 w-4" />
                    Preview & Send
                  </Button>
                </SheetFooter>
              </form>
            </Form>
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Did you send the email?</AlertDialogTitle>
            <AlertDialogDescription>
              We've opened your default email client with the pre-filled
              content.
              <br />
              <br />
              Click <strong>"Yes, I sent it"</strong> to log this activity in
              the timeline.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>
              No, I cancelled
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSend} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Yes, I sent it
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
