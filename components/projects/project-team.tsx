"use client";

import { useState } from "react";
import {
  Check,
  ChevronsUpDown,
  Plus,
  Trash,
  Crown,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { EmptyState } from "@/components/ui/empty-state";

interface TeamMember {
  user_id: string;
  role: string;
  user: {
    full_name: string;
    email: string;
    avatar_url?: string;
  };
}

interface ProjectTeamProps {
  members: TeamMember[];
  projectId: string;
  currentUserRole: string;
}

export function ProjectTeam({
  members,
  projectId,
  currentUserRole,
}: ProjectTeamProps) {
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("member");
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Fetch users when dialog opens
  const handleOpenChange = async (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen && users.length === 0) {
      const { data } = await supabase
        .from("users")
        .select("id, full_name, email")
        .order("full_name");

      if (data) setUsers(data);
    }
  };

  const handleAddMember = async () => {
    if (!selectedUser) return;
    setLoading(true);
    try {
      // Check if already member
      if (members.some((m) => m.user_id === selectedUser)) {
        toast.error("User is already a team member");
        return;
      }

      const { error } = await supabase.from("project_members").insert({
        project_id: projectId,
        user_id: selectedUser,
        role: selectedRole,
      });

      if (error) throw error;

      toast.success("Team member added");
      setOpen(false);
      setSelectedUser("");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to add member");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      const { error } = await supabase
        .from("project_members")
        .delete()
        .eq("project_id", projectId)
        .eq("user_id", userId);

      if (error) throw error;

      toast.success("Team member removed");
      router.refresh();
    } catch (error) {
      toast.error("Failed to remove member");
    }
  };

  const canManageTeam = ["admin", "manager"].includes(currentUserRole);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Team
          </CardTitle>
          <CardDescription>
            {members.length} member{members.length !== 1 && "s"}
          </CardDescription>
        </div>
        {canManageTeam && (
          <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                <Plus className="h-4 w-4" />
                <span className="sr-only">Add Member</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add Team Member</DialogTitle>
                <DialogDescription>
                  Search for a user to add to this project.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="flex flex-col space-y-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "w-full justify-between",
                          !selectedUser && "text-muted-foreground"
                        )}
                      >
                        {selectedUser
                          ? users.find((user) => user.id === selectedUser)
                              ?.full_name
                          : "Select user..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[380px] p-0">
                      <Command>
                        <CommandInput placeholder="Search users..." />
                        <CommandList>
                          <CommandEmpty>No user found.</CommandEmpty>
                          <CommandGroup>
                            {users.map((user) => (
                              <CommandItem
                                value={user.full_name}
                                key={user.id}
                                onSelect={() => {
                                  setSelectedUser(user.id);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    user.id === selectedUser
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                <div className="flex flex-col">
                                  <span>{user.full_name}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {user.email}
                                  </span>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="flex flex-col space-y-2">
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  onClick={handleAddMember}
                  disabled={!selectedUser || loading}
                >
                  Add Member
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent className="mt-4">
        {members.length === 0 ? (
          <EmptyState
            title="No team members"
            description="Assign team members to this project."
            className="py-4"
          />
        ) : (
          <div className="space-y-4">
            {members.map((member) => (
              <div
                key={member.user_id}
                className="flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={member.user.avatar_url} />
                    <AvatarFallback>
                      {member.user.full_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid gap-0.5">
                    <span className="text-sm font-medium leading-none">
                      {member.user.full_name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {member.user.email}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {member.role === "manager" && (
                    <Crown className="h-3 w-3 text-yellow-500" />
                  )}
                  <span className="text-xs text-muted-foreground capitalize mr-2">
                    {member.role}
                  </span>
                  {canManageTeam && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                      onClick={() => handleRemoveMember(member.user_id)}
                    >
                      <Trash className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
