"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface TableItem {
  id: string;
  tableNumber: string;
  capacity: number;
  location?: string;
  status?: string;
}

export default function TablesPage() {
  const [tables, setTables] = useState<TableItem[]>([]);
  const [qrMap, setQrMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTables = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'}/tables`, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch tables");
        const data = await res.json();
        setTables(data || []);

        // Generate QR codes for each table (backend returns dataURL)
        const map: Record<string, string> = {};
        await Promise.all(
          (data || []).map(async (t: any) => {
            try {
              const r = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'}/tables/${t.id}/generate-qr`, { method: "POST" });
              if (!r.ok) return;
              const json = await r.json();
              map[t.id] = json.qrCodeDataUrl;
            } catch (e) {
              // ignore per-item errors
            }
          })
        );

        setQrMap(map);
      } catch (err: any) {
        setError(err.message || "Error");
      } finally {
        setLoading(false);
      }
    };

    fetchTables();
  }, []);

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <main className="min-h-screen p-6 bg-slate-50">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Sơ đồ bàn & QR Code</h1>
            <p className="text-slate-500 mt-2">Chọn một bàn để bắt đầu gọi món (Mô phỏng quét mã QR)</p>
          </div>
          <Link href="/" className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            ← Quay lại Trang chủ
          </Link>
        </div>

        {loading && <div className="text-center py-12">Đang tải dữ liệu bàn...</div>}
        {error && <div className="text-center py-12 text-red-600">{error}</div>}

        {!loading && !error && tables.length === 0 && (
          <div className="text-center py-12 text-slate-500">Chưa có bàn nào được tạo. Vui lòng tạo bàn trong trang Admin.</div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {tables.map((t) => (
            <div key={t.id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <span className="font-bold text-lg text-slate-800">Bàn {t.tableNumber}</span>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${t.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' :
                    t.status === 'OCCUPIED' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                  {t.status === 'AVAILABLE' ? 'Trống' : t.status === 'OCCUPIED' ? 'Có khách' : t.status}
                </span>
              </div>

              <div className="p-6 flex flex-col items-center">
                <div className="relative group cursor-pointer w-48 h-48">
                  {qrMap[t.id] ? (
                    <Link href={`/guest?tableId=${t.id}`}>
                      <img
                        src={qrMap[t.id]}
                        alt={`QR ${t.tableNumber}`}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors rounded-lg" />
                    </Link>
                  ) : (
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 rounded-lg">
                      Processing...
                    </div>
                  )}
                </div>
                <div className="mt-4 text-sm text-slate-500">Sức chứa: {t.capacity} người</div>
              </div>

              <div className="p-4 bg-slate-50/50 border-t border-slate-100">
                <Link
                  href={`/guest?tableId=${t.id}`}
                  className="block w-full text-center bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 rounded-lg transition-colors"
                >
                  Chọn Bàn Này
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
