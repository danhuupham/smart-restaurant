import { Table } from '@/types/table';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { QrCode, Edit, Trash2, Power } from 'lucide-react';
import { tablesApi } from '@/lib/api/tables';
import toast from 'react-hot-toast';
import { useState } from 'react';
import QrCodeModal from './QrCodeModal';

interface TableListProps {
  tables: Table[];
  onEdit: (table: Table) => void;
  onUpdate: () => void;
}

export default function TableList({ tables, onEdit, onUpdate }: TableListProps) {
  const [qrCodeData, setQrCodeData] = useState<{ url: string; tableName: string } | null>(null);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this table?')) {
      try {
        const result = await tablesApi.delete(id);
        // If table has order history, backend sets it to INACTIVE instead of deleting
        if (result && result.status === 'INACTIVE') {
          toast.success('Table set to INACTIVE (has order history)');
        } else {
          toast.success('Table deleted successfully');
        }
        onUpdate();
      } catch (error: any) {
        console.error('Delete table error:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to delete table';
        toast.error(`Error: ${errorMessage}`);
      }
    }
  };

  const handleToggleStatus = async (table: Table) => {
    if (table.status === 'OCCUPIED') {
      toast.error('Cannot deactivate an occupied table');
      return;
    }

    const newStatus = table.status === 'INACTIVE' ? 'AVAILABLE' : 'INACTIVE';
    const action = newStatus === 'INACTIVE' ? 'deactivate' : 'activate';

    if (!confirm(`Are you sure you want to ${action} this table?`)) return;

    try {
      await tablesApi.update(table.id, { status: newStatus });
      toast.success(`Table is now ${newStatus}`);
      onUpdate();
    } catch (error: any) {
      console.error('Update status error:', error);
      toast.error('Failed to update status');
    }
  };

  const handleGenerateQr = async (table: Table) => {
    try {
      const { qrCodeDataUrl } = await tablesApi.generateQrCode(table.id);
      setQrCodeData({ url: qrCodeDataUrl, tableName: table.tableNumber });
    } catch (error: any) {
      console.error('Generate QR error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to generate QR code';
      toast.error(`Error: ${errorMessage}`);
    }
  };

  const handleRegenerateQr = async (tableId: string) => {
    try {
      if (!confirm('Are you sure? This will invalidate the previous QR code.')) return;
      const { qrCodeDataUrl } = await tablesApi.regenerateQrCode(tableId);
      setQrCodeData(prev => prev ? { ...prev, url: qrCodeDataUrl } : null);
      toast.success('QR Code Regenerated!');
    } catch (error: any) {
      toast.error('Failed to regenerate QR');
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>All Tables</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tables.map((table) => (
              <div key={table.id} className={`p-4 border rounded-lg shadow-sm ${table.status === 'INACTIVE' ? 'bg-gray-50 opacity-75' : 'bg-white'}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">{table.tableNumber}</h3>
                    <p className="text-gray-700">Capacity: {table.capacity}</p>
                    <p className="text-gray-700">Location: {table.location || 'N/A'}</p>
                    <p className="text-gray-700">
                      Status: <span className={`font-medium ${table.status === 'INACTIVE' ? 'text-gray-500' : table.status === 'AVAILABLE' ? 'text-green-600' : 'text-blue-600'}`}>{table.status}</span>
                    </p>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 mt-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleToggleStatus(table)}
                    title={table.status === 'INACTIVE' ? "Activate" : "Deactivate"}
                  >
                    <Power className={`h-4 w-4 ${table.status === 'INACTIVE' ? 'text-gray-400' : 'text-green-600'}`} />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => handleGenerateQr(table)}>
                    <QrCode className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => onEdit(table)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="icon" onClick={() => handleDelete(table.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      {qrCodeData && (
        <QrCodeModal
          qrCodeUrl={qrCodeData.url}
          tableName={qrCodeData.tableName}
          tableId={tables.find(t => t.tableNumber === qrCodeData.tableName)?.id || ''}
          onClose={() => setQrCodeData(null)}
          onRegenerate={handleRegenerateQr}
        />
      )}
    </>
  );
}
