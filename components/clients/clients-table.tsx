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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  location: string | null;
  phone: string | null;
  address: string | null;
  website: string | null;
  assigned_user: { full_name: string } | null;
  created_by: { full_name: string } | null;
  created_at: string;
}

interface ClientsTableProps {
  clients: Client[];
  userRole: string;
}

const statusColors = {
  lead: {
    variant: "secondary" as const,
    className: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  },
  active: {
    variant: "default" as const,
    className: "bg-green-100 text-green-800 hover:bg-green-100",
  },
  inactive: {
    variant: "outline" as const,
    className: "bg-gray-100 text-gray-800 hover:bg-gray-100",
  },
  churned: {
    variant: "destructive" as const,
    className: "bg-red-100 text-red-800 hover:bg-red-100",
  },
};

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
    location: true,
    phone: true,
    address: true,
    website: true,
    created_by: true,
    created_at: true,
  });

  // Filter & Search
  const filteredData = useMemo(() => {
    return clients.filter((client) => {
      const matchesSearch =
        client.name.toLowerCase().includes(search.toLowerCase()) ||
        client.email.toLowerCase().includes(search.toLowerCase()) ||
        client.company?.toLowerCase().includes(search.toLowerCase()) ||
        client.industry?.toLowerCase().includes(search.toLowerCase());

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
      "Created By": c.created_by?.full_name || "Unassigned",
      Location: c.location || "",
      Phone: c.phone || "",
      Address: c.address || "",
      Website: c.website || "",
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2"
            >
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
            </svg>
            Refresh
          </Button>

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

              {columnVisibility.location && (
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("location")}
                >
                  <div className="flex items-center hover:text-foreground">
                    Location
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
              )}
              {columnVisibility.phone && (
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("phone")}
                >
                  <div className="flex items-center hover:text-foreground">
                    Phone
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
              )}
              {columnVisibility.address && (
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("address")}
                >
                  <div className="flex items-center hover:text-foreground">
                    Address
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
              )}
              {columnVisibility.website && (
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("website")}
                >
                  <div className="flex items-center hover:text-foreground">
                    Website
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
              )}
              {columnVisibility.created_by && (
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("created_by")}
                >
                  <div className="flex items-center hover:text-foreground">
                    Created By
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
              )}
              {columnVisibility.created_at && (
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("created_at")}
                >
                  <div className="flex items-center hover:text-foreground">
                    Last Purchase
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
              )}
              {columnVisibility.actions && (
                <TableHead className="w-[100px] text-center">Action</TableHead>
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
                          ].variant
                        }
                        className={
                          statusColors[
                            client.status as keyof typeof statusColors
                          ].className
                        }
                      >
                        {client.status}
                      </Badge>
                    </TableCell>
                  )}
                  {columnVisibility.assigned && (
                    <TableCell className="hidden lg:table-cell">
                      {client.assigned_user ? (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {client.assigned_user.full_name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()
                                .slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <span>{client.assigned_user.full_name}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">
                          Unassigned
                        </span>
                      )}
                    </TableCell>
                  )}
                  {columnVisibility.ltv && (
                    <TableCell className="text-right">
                      ${Number(client.lifetime_value).toLocaleString()}
                    </TableCell>
                  )}
                  {columnVisibility.location && (
                    <TableCell>{client.location || "-"}</TableCell>
                  )}
                  {columnVisibility.phone && (
                    <TableCell>{client.phone || "-"}</TableCell>
                  )}
                  {columnVisibility.address && (
                    <TableCell>{client.address || "-"}</TableCell>
                  )}
                  {columnVisibility.website && (
                    <TableCell>{client.website || "-"}</TableCell>
                  )}
                  {columnVisibility.created_by && (
                    <TableCell>{client.created_by?.full_name || "-"}</TableCell>
                  )}
                  {columnVisibility.created_at && (
                    <TableCell>
                      {new Date(client.created_at).toLocaleDateString()}
                    </TableCell>
                  )}
                  {columnVisibility.actions && (
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          asChild
                        >
                          <Link href={`/clients/${client.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        {canEdit && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            asChild
                          >
                            <Link href={`/clients/${client.id}/edit`}>
                              <Pencil className="h-4 w-4" />
                            </Link>
                          </Button>
                        )}
                        {canDelete && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
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
