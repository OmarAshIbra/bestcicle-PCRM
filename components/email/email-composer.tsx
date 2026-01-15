"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { CheckCircle2 } from "lucide-react"

interface Client {
  id: string
  name: string
  email: string
  company: string | null
}

interface EmailTemplate {
  id: string
  name: string
  subject: string
  body: string
}

interface EmailComposerProps {
  clients: Client[]
  templates: EmailTemplate[]
}

export function EmailComposer({ clients, templates }: EmailComposerProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    client_id: "",
    template_id: "",
    subject: "",
    body: "",
  })

  function handleTemplateSelect(templateId: string) {
    const template = templates.find((t) => t.id === templateId)
    if (template) {
      setFormData({
        ...formData,
        template_id: templateId,
        subject: template.subject,
        body: template.body,
      })
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setSuccess(false)
    setLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("Not authenticated")

      const client = clients.find((c) => c.id === formData.client_id)
      if (!client) throw new Error("Client not found")

      // Replace template variables
      let finalBody = formData.body
      finalBody = finalBody.replace(/\{\{client_name\}\}/g, client.name)
      finalBody = finalBody.replace(/\{\{user_name\}\}/g, user.user_metadata?.full_name || "")

      // Create activity record for the email
      const { error: activityError } = await supabase.from("activities").insert({
        client_id: formData.client_id,
        user_id: user.id,
        type: "email",
        subject: formData.subject,
        description: finalBody,
        status: "completed",
        completed_at: new Date().toISOString(),
      })

      if (activityError) throw activityError

      // Simulate sending email (in MVP, we just log it)
      console.log("[v0] Email sent:", {
        to: client.email,
        subject: formData.subject,
        body: finalBody,
      })

      setSuccess(true)
      setFormData({
        client_id: "",
        template_id: "",
        subject: "",
        body: "",
      })

      setTimeout(() => setSuccess(false), 3000)
      router.refresh()
    } catch (err: any) {
      setError(err.message || "Failed to send email")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Compose Email</CardTitle>
        <CardDescription>Send an email to a client (simulated in MVP)</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-50 text-green-900 border-green-200">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>Email sent successfully and logged as activity!</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="client">
                To <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.client_id}
                onValueChange={(value) => setFormData({ ...formData, client_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name} ({client.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="template">Template (Optional)</Label>
              <Select value={formData.template_id} onValueChange={handleTemplateSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">
              Subject <span className="text-destructive">*</span>
            </Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              required
              disabled={loading}
              placeholder="Email subject"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">
              Message <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="body"
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              rows={10}
              required
              disabled={loading}
              placeholder="Email body (use {{client_name}} and {{user_name}} for personalization)"
            />
            <p className="text-xs text-muted-foreground">
              Tip: Use {"{{client_name}}"} and {"{{user_name}}"} for personalization
            </p>
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send Email"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
