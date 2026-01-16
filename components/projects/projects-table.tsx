"use client";

import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowUpDown,
  Download,
  Eye,
  Filter,
  MoreHorizontal,
  Pencil,
  Search,
  SlidersHorizontal,
  Trash,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { exportToCSV, exportToExcel } from "@/lib/export";
import { EmptyState } from "@/components/ui/empty-state";
import { format, parseISO } from "date-fns";
import { Briefcase } from "lucide-react";

interface Project {
  id: string;
  name: string;
  status: string;
  priority: string;
  due_date: string | null;
  client: { name: string } | null;
  created_by: string;
  created_at: string;
}

interface ProjectsTableProps {
  projects: Project[];
  userRole: string;
  currentUserId: string;
}

const statusColors: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  pending: "secondary",
  in_progress: "default",
  approved: "default",
  completed: "outline",
  rejected: "destructive",
  on_hold: "secondary",
  cancelled: "destructive",
};

const priorityColors: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  high: "destructive",
  medium: "default",
  low: "secondary",
};

type SortKey = keyof Project | "client_name";
type SortDirection = "asc" | "desc";

export function ProjectsTable({
  projects,
  userRole,
  currentUserId,
}: ProjectsTableProps) {
  // State
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState<{
    key: SortKey;
    direction: SortDirection;
  } | null>(null);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [columnVisibility, setColumnVisibility] = useState({
    name: true,
    client: true,
    status: true,
    priority: true,
    dueDate: true,
    actions: true,
  });

  // Filter & Search
  const filteredData = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch =
        project.name.toLowerCase().includes(search.toLowerCase()) ||
        project.client?.name.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || project.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [projects, search, statusFilter]);

  // Sort
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;

    return [...filteredData].sort((a, b) => {
      let aValue: any = a[sortConfig.key];
      let bValue: any = b[sortConfig.key];

      if (sortConfig.key === "client_name") {
        aValue = a.client?.name || "";
        bValue = b.client?.name || "";
      }

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Handlers
  const handleSort = (key: SortKey) => {
    setSortConfig((current) => ({
      key,
      direction:
        current?.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  const toggleSelectAll = () => {
    if (selectedRows.size === paginatedData.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(paginatedData.map((p) => p.id)));
    }
  };

  const toggleSelectRow = (id: string) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  const handleExport = (format: "csv" | "excel") => {
    const dataToExport =
      selectedRows.size > 0
        ? sortedData.filter((p) => selectedRows.has(p.id))
        : sortedData;

    const exportData = dataToExport.map((p) => ({
      Name: p.name,
      Client: p.client?.name || "Unknown",
      Status: p.status,
      Priority: p.priority,
      "Due Date": p.due_date
        ? new Date(p.due_date).toLocaleDateString()
        : "N/A",
      "Created At": new Date(p.created_at).toLocaleDateString(),
    }));

    if (format === "csv") {
      exportToCSV(exportData, "projects-export");
    } else {
      exportToExcel(exportData, "projects-export");
    }
  };

  const canCreate = true; // refined permission check could be here
  const canDelete = userRole === "admin";

  if (projects.length === 0) {
    return (
      <EmptyState
        title="No projects found"
        description="Get started by creating your first project."
        // icon={Briefcase}
        action={
          canCreate ? (
            <Button asChild>
              <Link href="/projects/new">Create Project</Link>
            </Button>
          ) : undefined
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <SelectValue placeholder="Status" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="on_hold">On Hold</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="hidden lg:flex">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {Object.keys(columnVisibility).map((key) => (
                <DropdownMenuCheckboxItem
                  key={key}
                  checked={
                    columnVisibility[key as keyof typeof columnVisibility]
                  }
                  onCheckedChange={(checked) =>
                    setColumnVisibility((prev) => ({ ...prev, [key]: checked }))
                  }
                  className="capitalize"
                >
                  {key}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport("csv")}>
                Export to CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("excel")}>
                Export to Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox
                  checked={
                    selectedRows.size === paginatedData.length &&
                    paginatedData.length > 0
                  }
                  onCheckedChange={toggleSelectAll}
                  aria-label="Select all"
                />
              </TableHead>
              {columnVisibility.name && (
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center hover:text-foreground">
                    Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
              )}
              {columnVisibility.client && (
                <TableHead
                  className="hidden md:table-cell cursor-pointer"
                  onClick={() => handleSort("client_name")}
                >
                  <div className="flex items-center hover:text-foreground">
                    Client
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
              )}
              {columnVisibility.status && (
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("status")}
                >
                  <div className="flex items-center hover:text-foreground">
                    Status
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
              )}
              {columnVisibility.priority && (
                <TableHead
                  className="hidden lg:table-cell cursor-pointer"
                  onClick={() => handleSort("priority")}
                >
                  <div className="flex items-center hover:text-foreground">
                    Priority
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
              )}
              {columnVisibility.dueDate && (
                <TableHead
                  className="hidden md:table-cell cursor-pointer text-right"
                  onClick={() => handleSort("due_date")}
                >
                  <div className="flex items-center justify-end hover:text-foreground">
                    Due Date
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
              )}
              {columnVisibility.actions && (
                <TableHead className="w-[50px]"></TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <p>No results found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((project) => (
                <TableRow
                  key={project.id}
                  data-state={selectedRows.has(project.id) && "selected"}
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedRows.has(project.id)}
                      onCheckedChange={() => toggleSelectRow(project.id)}
                      aria-label={`Select ${project.name}`}
                    />
                  </TableCell>
                  {columnVisibility.name && (
                    <TableCell className="font-medium">
                      <Link
                        href={`/projects/${project.id}`}
                        className="hover:underline"
                      >
                        {project.name}
                      </Link>
                    </TableCell>
                  )}
                  {columnVisibility.client && (
                    <TableCell className="hidden md:table-cell">
                      {project.client?.name || "Unknown"}
                    </TableCell>
                  )}
                  {columnVisibility.status && (
                    <TableCell>
                      <Badge
                        variant={
                          statusColors[
                            project.status as keyof typeof statusColors
                          ] || "secondary"
                        }
                        className="capitalize"
                      >
                        {project.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                  )}
                  {columnVisibility.priority && (
                    <TableCell className="hidden lg:table-cell">
                      <Badge
                        variant={
                          priorityColors[
                            project.priority as keyof typeof priorityColors
                          ] || "secondary"
                        }
                        className="capitalize"
                      >
                        {project.priority}
                      </Badge>
                    </TableCell>
                  )}
                  {columnVisibility.dueDate && (
                    <TableCell className="hidden md:table-cell text-right">
                      {project.due_date
                        ? format(parseISO(project.due_date), "MMM d, yyyy")
                        : "-"}
                    </TableCell>
                  )}
                  {columnVisibility.actions && (
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/projects/${project.id}`}
                              className="cursor-pointer"
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          {/* Add edit/delete based on role */}
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/projects/${project.id}/edit`}
                              className="cursor-pointer"
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit Project
                            </Link>
                          </DropdownMenuItem>
                          {canDelete && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive cursor-pointer">
                                <Trash className="mr-2 h-4 w-4" />
                                Delete Project
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        <div className="flex-1 text-sm text-muted-foreground">
          {selectedRows.size} of {sortedData.length} row(s) selected.
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Rows per page</p>
            <Select
              value={`${pageSize}`}
              onValueChange={(value) => {
                setPageSize(Number(value));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              <span className="sr-only">Go to first page</span>
              <span aria-hidden="true">&laquo;</span>
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <span className="sr-only">Go to previous page</span>
              <span aria-hidden="true">&lsaquo;</span>
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <span className="sr-only">Go to next page</span>
              <span aria-hidden="true">&rsaquo;</span>
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              <span className="sr-only">Go to last page</span>
              <span aria-hidden="true">&raquo;</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
