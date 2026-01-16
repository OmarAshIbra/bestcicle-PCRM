"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Upload,
  AlertCircle,
  FileSpreadsheet,
  CheckCircle2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { useRouter } from "next/navigation";

export function BulkImportDialog() {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const supabase = createClient();
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      parseFile(selectedFile);
    }
  };

  const parseFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(sheet) as any[];
        // Basic validation: check if 'name' and 'email' keys exist in the first row
        if (json.length > 0) {
          // keys might be case sensitive, let's normalize headers if we really wanted to be robust
          // for now assume user provides correct headers: name, email, phone, company...
        }
        setPreviewData(json.slice(0, 5)); // Preview first 5
      } catch (err) {
        toast.error("Failed to parse file");
        console.error(err);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleImport = async () => {
    if (!file) return;
    setIsLoading(true);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet) as any[];

        if (jsonData.length === 0) {
          toast.error("File is empty");
          setIsLoading(false);
          return;
        }

        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          toast.error("You must be logged in");
          setIsLoading(false);
          return;
        }

        // Map and clean data
        const clientsToInsert = jsonData
          .map((row) => ({
            name: row.name || row.Name || "Unknown",
            email: row.email || row.Email || "",
            phone: row.phone || row.Phone,
            company: row.company || row.Company,
            industry: row.industry || row.Industry,
            created_by: user.id,
            status: "lead", // Default status
          }))
          .filter((c) => c.email); // specific validation: email is required

        const { error } = await supabase
          .from("clients")
          .insert(clientsToInsert);

        if (error) {
          throw error;
        }

        toast.success(
          `Successfully imported ${clientsToInsert.length} clients`
        );
        setOpen(false);
        setFile(null);
        setPreviewData([]);
        router.refresh();
      };
      reader.readAsBinaryString(file);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to import clients");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="mr-2 h-4 w-4" />
          Bulk Import
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Import Clients</DialogTitle>
          <DialogDescription>
            Upload a CSV or Excel file. Required columns: name, email.
            <br />
            Optional: phone, company, industry.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="file">File</Label>
            <Input
              id="file"
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
            />
          </div>
          {previewData.length > 0 && (
            <div className="rounded-md bg-muted p-2 text-xs">
              <p className="font-semibold mb-1">Preview (first 5 rows):</p>
              <ul className="space-y-1">
                {previewData.map((row, i) => (
                  <li key={i} className="truncate">
                    {row.name || row.Name} - {row.email || row.Email}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={handleImport} disabled={!file || isLoading}>
            {isLoading ? "Importing..." : "Import Clients"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
