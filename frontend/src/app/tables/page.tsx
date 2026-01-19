"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useI18n } from "@/contexts/I18nContext";
import { Users, ArrowLeft, QrCode } from "lucide-react";
import LanguageSwitcher from "@/components/LanguageSwitcher";

interface TableItem {
  id: string;
  tableNumber: string;
  capacity: number;
  location?: string;
  status?: string;
}

function TablesContent() {
  const { t } = useI18n();
  const [tables, setTables] = useState<TableItem[]>([]);
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
      } catch (err: any) {
        setError(err.message || "Error");
      } finally {
        setLoading(false);
      }
    };

    fetchTables();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f6fa]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          <p className="text-gray-500">{t('tables.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f6fa] p-6">
        <div className="text-center">
          <p className="text-red-500 mb-4">{t('tables.error')}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white pb-safe">
      {/* Mobile Header */}
      <div className="bg-white/80 backdrop-blur-md px-4 py-3 sticky top-0 z-50 flex items-center justify-between shadow-sm border-b border-orange-100">
        <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-orange-50 text-gray-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="font-bold text-lg text-gray-800">{t('tables.title')}</h1>
        <LanguageSwitcher />
      </div>

      <div className="p-4">
        {/* Info Banner */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4 rounded-2xl flex items-start gap-3 mb-6 shadow-lg shadow-orange-200">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
            <QrCode className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-medium text-sm">
              {t('tables.subtitle')}
            </p>
          </div>
        </div>

        {tables.length === 0 ? (
          <div className="text-center py-12 text-slate-500">{t('tables.empty')}</div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {tables.map((table) => {
              const isAvailable = table.status === 'AVAILABLE';
              const isOccupied = table.status === 'OCCUPIED';
              const isInactive = !isAvailable && !isOccupied;

              return (
                <Link
                  key={table.id}
                  href={isInactive ? '#' : `/guest?tableId=${table.id}`}
                  className={`relative p-4 rounded-2xl border-2 transition-all ${isInactive
                    ? 'bg-gray-100 border-gray-200 opacity-60 cursor-not-allowed'
                    : isOccupied
                      ? 'bg-red-50 border-red-200 hover:border-red-300 hover:shadow-md active:scale-[0.98]'
                      : 'bg-white border-green-200 hover:border-green-400 hover:shadow-lg active:scale-[0.98] shadow-sm'
                    }`}
                  onClick={(e) => isInactive && e.preventDefault()}
                >
                  {/* Status Badge */}
                  <div className={`absolute -top-2 -right-2 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide shadow-sm ${isAvailable
                    ? 'bg-green-500 text-white'
                    : isOccupied
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-400 text-white'
                    }`}>
                    {isAvailable ? t('tables.available') : isOccupied ? t('tables.occupied') : t('tables.inactive')}
                  </div>

                  {/* Table Name & Info */}
                  <div className="mb-3 pt-2">
                    <div className={`text-xl font-black truncate ${isInactive ? 'text-gray-400' : isOccupied ? 'text-red-600' : 'text-gray-800'
                      }`}>
                      Bàn {table.tableNumber}
                    </div>
                    <div className={`text-sm flex items-center gap-1 mt-1 ${isInactive ? 'text-gray-400' : 'text-gray-500'}`}>
                      <Users className="w-4 h-4" />
                      <span>{table.capacity} người</span>
                    </div>
                  </div>

                  {/* Select Button */}
                  <button
                    className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all ${isInactive
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : isOccupied
                        ? 'bg-red-100 text-red-600 hover:bg-red-200'
                        : 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md shadow-orange-200 hover:shadow-lg'
                      }`}
                    disabled={isInactive}
                  >
                    {isInactive ? t('tables.unavailable') : isOccupied ? t('tables.occupied') : t('tables.selectTable')}
                  </button>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
export default function TablesPage() {
  return (
    <main>
      <Suspense fallback={<div>Loading...</div>}>
        <TablesContent />
      </Suspense>
    </main>
  )
}
