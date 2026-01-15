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
  ChevronDown,
  Download,
  Eye,
  Filter,
  MoreHorizontal,
  Pencil,
  Search,
  SlidersHorizontal,
  Trash,
} from "lucide-react";
import Link from "next/link";
import { exportToCSV, exportToExcel } from "@/lib/export";
import { EmptyState } from "@/components/ui/empty";

interface Client {
  id: string;
  name: string;
  email: string;
  company: string | null;
  industry: string | null;
  status: string;
  lifetime_value: number;
  assigned_user: { full_name: string } | null;
  created_at: string;
}

interface ClientsTableProps {
  clients: Client[];
  userRole: string;
}

const statusColors = {
  lead: "secondary",
  active: "default",
  inactive: "outline",
  churned: "destructive",
} as const;

type SortKey = keyof Client | "assigned_user";
type SortDirection = "asc" | "desc";

export function ClientsTable({ clients, userRole }: ClientsTableProps) {
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
    company: true,
    industry: true,
    status: true,
    assigned: true,
    ltv: true,
    actions: true,
  });

  // Filter & Search
  const filteredData = useMemo(() => {
    return clients.filter((client) => {
      const matchesSearch =
        client.name.toLowerCase().includes(search.toLowerCase()) ||
        client.email.toLowerCase().includes(search.toLowerCase()) ||
        client.company?.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || client.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [clients, search, statusFilter]);

  // Sort
  const sortedData = useMemo(() => {
    if (!sortConfig) return filteredData;

    return [...filteredData].sort((a, b) => {
      let aValue: any = a[sortConfig.key];
      let bValue: any = b[sortConfig.key];

      // Handle nested assigned_user
      if (sortConfig.key === "assigned_user") {
        aValue = a.assigned_user?.full_name || "";
        bValue = b.assigned_user?.full_name || "";
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
      setSelectedRows(new Set(paginatedData.map((c) => c.id)));
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
        ? sortedData.filter((c) => selectedRows.has(c.id))
        : sortedData;

    const exportData = dataToExport.map((c) => ({
      Name: c.name,
      Email: c.email,
      Company: c.company || "",
      Industry: c.industry || "",
      Status: c.status,
      "Assigned To": c.assigned_user?.full_name || "Unassigned",
      "Lifetime Value": c.lifetime_value,
      "Created At": new Date(c.created_at).toLocaleDateString(),
    }));

    if (format === "csv") {
      exportToCSV(exportData, "clients-export");
    } else {
      exportToExcel(exportData, "clients-export");
    }
  };

  const canEdit = ["admin", "manager"].includes(userRole);
  const canDelete = userRole === "admin";

  if (clients.length === 0) {
    return (
      <EmptyState
        title="No clients found"
        description="Get started by adding your first client."
        action={
          canEdit ? (
            <Button asChild>
              <Link href="/clients/new">Add Client</Link>
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
              placeholder="Search clients..."
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
              <SelectItem value="lead">Lead</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="churned">Churned</SelectItem>
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
              {columnVisibility.company && (
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("company")}
                >
                  <div className="flex items-center hover:text-foreground">
                    Company
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
              )}
              {columnVisibility.industry && (
                <TableHead
                  className="hidden md:table-cell cursor-pointer"
                  onClick={() => handleSort("industry")}
                >
                  <div className="flex items-center hover:text-foreground">
                    Industry
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
              {columnVisibility.assigned && (
                <TableHead
                  className="hidden lg:table-cell cursor-pointer"
                  onClick={() => handleSort("assigned_user")}
                >
                  <div className="flex items-center hover:text-foreground">
                    Assigned To
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
              )}
              {columnVisibility.ltv && (
                <TableHead
                  className="text-right cursor-pointer"
                  onClick={() => handleSort("lifetime_value")}
                >
                  <div className="flex items-center justify-end hover:text-foreground">
                    LTV
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
                <TableCell colSpan={8} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <p>No results found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((client) => (
                <TableRow
                  key={client.id}
                  data-state={selectedRows.has(client.id) && "selected"}
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedRows.has(client.id)}
                      onCheckedChange={() => toggleSelectRow(client.id)}
                      aria-label={`Select ${client.name}`}
                    />
                  </TableCell>
                  {columnVisibility.name && (
                    <TableCell className="font-medium">
                      <div>
                        <div>{client.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {client.email}
                        </div>
                      </div>
                    </TableCell>
                  )}
                  {columnVisibility.company && (
                    <TableCell>{client.company || "-"}</TableCell>
                  )}
                  {columnVisibility.industry && (
                    <TableCell className="hidden md:table-cell">
                      {client.industry || "-"}
                    </TableCell>
                  )}
                  {columnVisibility.status && (
                    <TableCell>
                      <Badge
                        variant={
                          statusColors[
                            client.status as keyof typeof statusColors
                          ]
                        }
                      >
                        {client.status}
                      </Badge>
                    </TableCell>
                  )}
                  {columnVisibility.assigned && (
                    <TableCell className="hidden lg:table-cell">
                      {client.assigned_user?.full_name || "Unassigned"}
                    </TableCell>
                  )}
                  {columnVisibility.ltv && (
                    <TableCell className="text-right">
                      ${Number(client.lifetime_value).toLocaleString()}
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
                              href={`/clients/${client.id}`}
                              className="cursor-pointer"
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          {canEdit && (
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/clients/${client.id}/edit`}
                                className="cursor-pointer"
                              >
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit Client
                              </Link>
                            </DropdownMenuItem>
                          )}
                          {canDelete && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive cursor-pointer">
                                <Trash className="mr-2 h-4 w-4" />
                                Delete Client
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
