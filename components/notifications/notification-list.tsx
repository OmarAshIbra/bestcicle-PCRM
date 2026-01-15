"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  type: string;
}

interface NotificationListProps {
  initialNotifications: Notification[];
}

export function NotificationList({
  initialNotifications,
}: NotificationListProps) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const supabase = createClient();

  const markAsRead = async (id: string) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );

    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
  };

  const markAllAsRead = async () => {
    // Optimistic
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));

    const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id);
    if (unreadIds.length === 0) return;

    try {
      await supabase
        .from("notifications")
        .update({ is_read: true })
        .in("id", unreadIds);
      toast.success("All marked as read");
    } catch (e) {
      toast.error("Failed to mark all as read");
    }
  };

  const hasUnread = notifications.some((n) => !n.is_read);

  return (
    <div>
      {hasUnread && (
        <div className="p-4 border-b flex justify-end bg-muted/20">
          <Button variant="ghost" size="sm" onClick={markAllAsRead}>
            <CheckCheck className="mr-2 h-4 w-4" />
            Mark all read
          </Button>
        </div>
      )}
      <div className="divide-y">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={cn(
              "p-4 flex flex-col sm:flex-row sm:items-start gap-4 hover:bg-muted/50 transition-colors",
              !notification.is_read && "bg-muted/30"
            )}
          >
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                {!notification.is_read && (
                  <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                )}
                <p className="font-medium leading-none">{notification.title}</p>
              </div>
              <p className="text-sm text-muted-foreground">
                {notification.message}
              </p>
              <p className="text-xs text-muted-foreground pt-1">
                {formatDistanceToNow(new Date(notification.created_at), {
                  addSuffix: true,
                })}
              </p>
            </div>
            {!notification.is_read && (
              <Button
                variant="ghost"
                size="sm"
                className="shrink-0"
                onClick={() => markAsRead(notification.id)}
              >
                Mark read
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
