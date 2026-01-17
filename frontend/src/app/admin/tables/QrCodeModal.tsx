
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/Dialog';
import Button from '@/components/ui/Button';
import Image from 'next/image';
import { Download, Printer } from 'lucide-react';

interface QrCodeModalProps {
  qrCodeUrl: string;
  tableName: string;
  onClose: () => void;
}

export default function QrCodeModal({ qrCodeUrl, tableName, onClose }: QrCodeModalProps) {
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head><title>Print QR Code</title></head>
          <body style="text-align: center; margin-top: 50px;">
            <h2>Table: ${tableName}</h2>
            <img src="${qrCodeUrl}" alt="QR Code for table ${tableName}" />
            <script>
              window.onload = () => {
                window.print();
                window.onafterprint = () => window.close();
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const handleDownload = () => {
    // Create a temporary link element
    const link = document.createElement('a');
    link.href = qrCodeUrl; // base64 data URL
    link.download = `table-${tableName}-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>QR Code for Table: {tableName}</DialogTitle>
        </DialogHeader>
        <div className="flex justify-center my-4">
          <Image src={qrCodeUrl} alt={`QR Code for ${tableName}`} width={256} height={256} />
        </div>
        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button variant="outline" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download PNG
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
