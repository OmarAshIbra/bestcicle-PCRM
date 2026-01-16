"use client";

import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Bell, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  type: string;
  action_url?: string; // Derived from type/target
}

export function NotificationDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const fetchNotifications = async () => {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) return;

    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", session.session.user.id)
      .eq("is_read", false)
      .order("created_at", { ascending: false })
      .limit(5);

    if (data) {
      setNotifications(data);
      setUnreadCount(data.length); // Simplified count for now
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Subscribe to realtime changes could be added here
    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const markAsRead = async (id: string, url?: string) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    setUnreadCount((prev) => Math.max(0, prev - 1));

    if (url) {
      setOpen(false);
      router.push(url);
    }
  };

  const markAllRead = async () => {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) return;

    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", session.session.user.id)
      .eq("is_read", false);

    setNotifications([]);
    setUnreadCount(0);
  };

  const getNotificationLink = (n: Notification) => {
    // Logic to derive link based on notification content/type if action_target_id exists
    // For MVP, simplistic mapping or basic link
    return "/notifications";
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="size-6" />
          <span className="sr-only">Notifications</span>
          {unreadCount > 0 && (
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive ring-1 ring-background" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-4 py-2">
          <span className="font-semibold text-sm">Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-xs text-muted-foreground hover:text-primary"
              onClick={markAllRead}
            >
              Mark all read
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <div className="flex flex-col gap-2 p-8 text-center text-sm text-muted-foreground">
            <Bell className="mx-auto h-8 w-8 opacity-50" />
            <p>No new notifications</p>
          </div>
        ) : (
          <div className="max-h-[300px] overflow-y-auto">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className="flex flex-col items-start gap-1 p-3 cursor-pointer"
                onClick={() =>
                  markAsRead(notification.id, getNotificationLink(notification))
                }
              >
                <div className="flex w-full justify-between items-start gap-2">
                  <span className="font-medium text-sm leading-none">
                    {notification.title}
                  </span>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                    {formatDistanceToNow(new Date(notification.created_at), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {notification.message}
                </p>
              </DropdownMenuItem>
            ))}
          </div>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          asChild
          className="cursor-pointer justify-center text-primary w-full text-center"
        >
          <Link href="/notifications">View all notifications</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
