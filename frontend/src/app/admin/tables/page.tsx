"use client";

import useSWR from "swr";
import { tablesApi } from "@/lib/api/tables";
import { Table } from "@/types/table";
import { useState } from "react";
import TableList from "./TableList";
import TableFormModal from "./TableFormModal";
import Button from "@/components/ui/Button";
import * as Icons from "lucide-react";

const fetcher = () => tablesApi.getAll();


import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import toast from 'react-hot-toast';

export default function TablesPage() {
  const { data: tables, error, mutate } = useSWR<Table[]>("tables", fetcher);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleEdit = (table: Table) => {
    setSelectedTable(table);
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setSelectedTable(null);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedTable(null);
  };

  const handleSuccess = () => {
    mutate();
  }

  const handleDownloadAllQr = async () => {
    if (!tables || tables.length === 0) {
      toast.error("No tables to download");
      return;
    }

    setIsDownloading(true);
    const zip = new JSZip();

    try {
      // Generate/Fetch QR for each table
      // Note: Ideally backend should provide a bulk download endpoint, but for now we iterate
      // Optimization: If table already has a QR token, we can just generate the QR on client or re-fetch partial data.
      // But to get the actual image dataUrl, we rely on the generateQrCode endpoint which returns the base64.

      let count = 0;
      for (const table of tables) {
        try {
          // We use generate (or separate get QR endpoint if we don't want to re-roll tokens)
          // If we use generateQrCode, it MIGHT re-roll if not exist, or just return existing.
          // The current backend implementation of generateQrCode: 
          // - If token exists, returns QR based on it.
          // - If no token, creates one. 
          // So it IS safe to call multiple times without invalidating previous ones (unless we call regenerate).

          const { qrCodeDataUrl } = await tablesApi.generateQrCode(table.id);

          // content is "data:image/png;base64,..."
          const base64Data = qrCodeDataUrl.split(',')[1];

          // Filename: Table-Number.png - Sanitize table number just in case
          const safelyNamed = table.tableNumber.replace(/[^a-z0-9]/gi, '_').toLowerCase();
          zip.file(`Table-${safelyNamed}.png`, base64Data, { base64: true });
          count++;
        } catch (e) {
          console.error(`Failed to get QR for table ${table.tableNumber}`, e);
        }
      }

      if (count > 0) {
        const content = await zip.generateAsync({ type: 'blob' });
        saveAs(content, 'restaurant-qr-codes.zip');
        toast.success(`Downloaded ${count} QR codes`);
      } else {
        toast.error("Failed to generate any QR codes");
      }

    } catch (err) {
      console.error("Bulk download failed", err);
      toast.error("Failed to download zip");
    } finally {
      setIsDownloading(false);
    }
  };

  if (error) return <div>Failed to load tables</div>;
  if (!tables) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Table Management</h1>
        <div className="flex gap-4">
          <Button onClick={handleDownloadAllQr} variant="outline" disabled={isDownloading}>
            <Icons.Download className="mr-2 h-4 w-4" />
            {isDownloading ? 'Zipping...' : 'Download All QR'}
          </Button>
          <Button onClick={handleAddNew}>
            <Icons.PlusCircle className="mr-2 h-4 w-4" /> Add New Table
          </Button>
        </div>
      </div>

      <TableList tables={tables} onEdit={handleEdit} onUpdate={mutate} />

      <TableFormModal
        isOpen={isFormOpen}
        table={selectedTable}
        onClose={handleFormClose}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
