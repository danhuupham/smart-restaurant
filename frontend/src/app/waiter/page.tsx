// [File: frontend/app/waiter/page.tsx]
"use client";

import { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import BillModal from "@/components/waiter/BillModal";
import OrderTimer from "@/components/OrderTimer";
import { Order } from "@/types";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useI18n } from "@/contexts/I18nContext";
import { tablesApi } from "@/lib/api/tables";
import { Table } from "@/types/table";
import { api } from "@/lib/api/api";

interface OrderWithRelations extends Order {
  table: { tableNumber: string };
  items: (Order['items'][0] & {
    product: { name: string };
    modifiers?: { name?: string; modifierOption?: { name: string } }[];
  })[];
}

export default function WaiterPage() {
  const { t } = useI18n();
  const [orders, setOrders] = useState<OrderWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithRelations | null>(null);
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const [assignedTables, setAssignedTables] = useState<Table[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showTables, setShowTables] = useState(false);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders');
      setOrders(res.data ?? []);
      setLoading(false);
    } catch (error) {
      console.error('Error loading orders:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await api.get('/auth/profile');
        setCurrentUserId(res.data.id);
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
      }
    };
    fetchUserProfile();
  }, []);

  const assignedTablesRef = useRef<Table[]>([]);

  useEffect(() => {
    assignedTablesRef.current = assignedTables;
  }, [assignedTables]);

  useEffect(() => {
    if (currentUserId) {
      const fetchAssignedTables = async () => {
        try {
          const tables = await tablesApi.getAssignedTables(currentUserId);
          setAssignedTables(tables);
        } catch (error) {
          console.error('Failed to fetch assigned tables:', error);
        }
      };
      fetchAssignedTables();
    }
  }, [currentUserId]);

  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
    let socket: any = null;

    import('socket.io-client').then((mod) => {
      socket = mod.io(socketUrl, {
        transports: ['websocket', 'polling'],
      });

      socket.on('connect', () => {
        console.log('Waiter socket connected:', socket.id);
        socket.emit('join', 'waiter');
      });

      const playNotificationSound = () => {
        try {
          const audio = new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg");
          audio.play().catch(e => console.error("Error playing sound:", e));
        } catch (e) {
          console.error("Audio error:", e);
        }
      };

      socket.on('new_order', (order: any) => {
        const myTableIds = assignedTablesRef.current.map((t: Table) => t.id);
        if (myTableIds.length > 0 && !myTableIds.includes(order.tableId)) {
          return;
        }
        playNotificationSound();
        toast('🔔 Đơn mới vừa tới!', {
          duration: 5000,
          position: 'top-right',
          style: { background: '#f59e0b', color: '#fff', padding: '16px', borderRadius: '8px' },
          icon: '📋',
        });
        fetchOrders();
      });

      socket.on('order_updated', (order: any) => {
        // Phát chuông khi món sẵn sàng (từ bếp)
        if (order?.status === 'READY') {
          const myTableIds = assignedTablesRef.current.map((t: Table) => t.id);
          // Chỉ phát chuông nếu là bàn của mình hoặc chưa được phân công bàn
          if (myTableIds.length === 0 || myTableIds.includes(order.tableId)) {
            playNotificationSound();
            toast(`Bàn ${order.table?.tableNumber || '?'} - Món đã sẵn sàng!`, {
              duration: 5000,
              position: 'top-right',
              style: { background: '#22c55e', color: '#fff', padding: '16px', borderRadius: '8px' },
            });
          }
        }
        fetchOrders();
      });

      socket.on('table_notification', (data: any) => {
        const myTableIds = assignedTablesRef.current.map((t: Table) => t.id);
        if (myTableIds.length > 0 && !myTableIds.includes(data.tableId)) {
          return;
        }
        playNotificationSound();
        const msg = data.type === 'PAYMENT_CASH' ? 'gọi thanh toán tiền mặt!'
          : data.type === 'PAYMENT_QR' ? 'gọi thanh toán QR!'
            : 'cần hỗ trợ!';
        toast(`🔔 Bàn ${data.tableName} ${msg}`, {
          duration: 10000,
          position: 'top-center',
          style: { background: '#e74c3c', color: '#fff', padding: '16px', borderRadius: '8px' },
          icon: '🏃',
        });
      });
    });

    return () => {
      if (socket) socket.disconnect();
    };
  }, []);

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'}/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const messages: Record<string, string> = {
        SERVED: "Đã bưng món ra bàn! 🏃",
        COMPLETED: "Đã thanh toán xong! 💰",
        ACCEPTED: "Đơn đã được chấp nhận.",
        REJECTED: "Đơn đã bị từ chối.",
      };
      toast.success(messages[newStatus] ?? "Cập nhật trạng thái");
      fetchOrders();
    } catch (error) {
      toast.error("Lỗi cập nhật");
    }
  };

  const handleOpenBill = (order: OrderWithRelations) => {
    setSelectedOrder(order);
    setIsBillModalOpen(true);
  };

  const handleOrderUpdated = (updated: Order | OrderWithRelations) => {
    setSelectedOrder(updated as OrderWithRelations);
    setOrders((prev) => prev.map((o) => (o.id === updated.id ? { ...o, ...updated } as OrderWithRelations : o)));
    fetchOrders();
  };

  const getOrdersByStatus = (status: string) => orders.filter(o => o.status === status);

  const pendingOrders = getOrdersByStatus('PENDING');
  const readyOrders = getOrdersByStatus('READY');
  const servedOrders = getOrdersByStatus('SERVED');

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-slate-500 font-medium animate-pulse">{t('common.loading')}</div>
    </div>
  );

  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-8 py-5 flex justify-between items-center shadow-sm z-10 shrink-0">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase">
            WDS <span className="text-purple-600">Smart Waiter</span>
          </h1>
          <p className="text-sm text-slate-400 font-semibold tracking-wider uppercase mt-1">{t('waiter.title')}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-2 text-sm font-bold">
            <span className="bg-yellow-100 text-yellow-900 border border-yellow-300 px-3 py-1.5 rounded-full">
              {t('waiter.pending') || 'Chờ duyệt'}: {pendingOrders.length}
            </span>
            <span className="bg-green-100 text-green-900 border border-green-300 px-3 py-1.5 rounded-full">
              {t('waiter.readyToServe')}: {readyOrders.length}
            </span>
            <span className="bg-blue-100 text-blue-900 border border-blue-300 px-3 py-1.5 rounded-full">
              {t('waiter.currentlyServing')}: {servedOrders.length}
            </span>
          </div>
          <button
            onClick={() => setShowTables(!showTables)}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${showTables
              ? 'bg-purple-600 text-white'
              : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
              }`}
          >
            {showTables ? t('waiter.hideTables') : `${t('waiter.myTables')} (${assignedTables.length})`}
          </button>
          <LanguageSwitcher />
          <button
            onClick={async () => {
              await fetch('/api/auth/logout', { method: 'POST' });
              localStorage.removeItem('accessToken');
              window.location.href = '/login';
            }}
            className="bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 px-6 rounded-xl text-sm transition-all uppercase tracking-wide"
          >
            {t('common.logout')}
          </button>
        </div>
      </header>

      {/* Assigned Tables Panel */}
      {showTables && (
        <div className="bg-purple-50 border-b border-purple-200 px-6 py-4 shrink-0">
          <h3 className="font-bold text-purple-800 mb-3">{t('waiter.assignedTables')}</h3>
          {assignedTables.length === 0 ? (
            <p className="text-purple-600 text-sm italic">{t('waiter.noAssignedTables')}</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {assignedTables.map((table) => (
                <div
                  key={table.id}
                  className={`px-4 py-2 rounded-lg text-sm font-bold ${table.status === 'OCCUPIED'
                    ? 'bg-red-100 text-red-800 border border-red-300'
                    : table.status === 'RESERVED'
                      ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                      : 'bg-green-100 text-green-800 border border-green-300'
                    }`}
                >
                  {t('waiter.table')} {table.tableNumber}
                  <span className="ml-2 text-xs opacity-70">
                    {table.status === 'OCCUPIED' ? t('waiter.tableOccupied') : table.status === 'RESERVED' ? t('waiter.tableReserved') : t('waiter.tableAvailable')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Kanban Board - 3 Columns */}
      <div className="flex-1 p-6 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">

          {/* Column 1: PENDING - Chờ duyệt */}
          <OrderColumn
            title={t('waiter.pending')}
            count={pendingOrders.length}
            orders={pendingOrders}
            bgColor="bg-yellow-50/50"
            borderColor="border-yellow-200"
            titleColor="text-yellow-700"
            emptyMessage={t('waiter.noPending')}
            renderCard={(order: OrderWithRelations) => (
              <PendingOrderCard key={order.id} order={order} updateStatus={updateStatus} t={t} />
            )}
          />

          {/* Column 2: READY - Món sẵn sàng bưng */}
          <OrderColumn
            title={t('waiter.readyToServe')}
            count={readyOrders.length}
            orders={readyOrders}
            bgColor="bg-green-50/50"
            borderColor="border-green-200"
            titleColor="text-green-700"
            emptyMessage={t('waiter.noReady')}
            renderCard={(order: OrderWithRelations) => (
              <ReadyOrderCard key={order.id} order={order} updateStatus={updateStatus} t={t} />
            )}
          />

          {/* Column 3: SERVED - Đang ăn */}
          <OrderColumn
            title={t('waiter.currentlyServing')}
            count={servedOrders.length}
            orders={servedOrders}
            bgColor="bg-blue-50/50"
            borderColor="border-blue-200"
            titleColor="text-blue-700"
            emptyMessage={t('waiter.noServed')}
            renderCard={(order: OrderWithRelations) => (
              <ServedOrderCard key={order.id} order={order} updateStatus={updateStatus} handleOpenBill={handleOpenBill} t={t} />
            )}
          />
        </div>
      </div>

      <BillModal
        isOpen={isBillModalOpen}
        onClose={() => setIsBillModalOpen(false)}
        order={selectedOrder}
        tableNumber={selectedOrder?.table.tableNumber ?? "?"}
        onOrderUpdated={handleOrderUpdated}
      />
    </div>
  );
}

// --- Sub Components ---

function OrderColumn({ title, count, orders, bgColor, borderColor, titleColor, emptyMessage, renderCard }: any) {
  return (
    <div className={`flex flex-col h-full rounded-2xl border-2 ${borderColor} ${bgColor} overflow-hidden shadow-sm`}>
      {/* Column Header */}
      <div className="p-5 border-b border-gray-100/50 flex justify-between items-center bg-white/50 backdrop-blur-sm shrink-0">
        <h2 className={`font-black tracking-tight text-2xl uppercase ${titleColor}`}>{title}</h2>
        <span className={`px-4 py-1.5 rounded-full text-lg font-bold bg-white shadow-sm ring-1 ring-inset ring-gray-200 ${titleColor}`}>
          {count}
        </span>
      </div>

      {/* Scrollable List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {orders.length === 0 ? (
          <p className="text-center text-gray-400 italic py-8">{emptyMessage}</p>
        ) : (
          orders.map((order: any) => renderCard(order))
        )}
      </div>
    </div>
  );
}

function PendingOrderCard({ order, updateStatus, t }: any) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex flex-col gap-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-start pb-4 border-b border-dashed border-slate-200">
        <div>
          <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">{t('waiter.table')}</div>
          <div className="text-5xl font-black text-slate-800 leading-none">{order.table?.tableNumber || "?"}</div>
        </div>
        <div className="flex flex-col items-end">
          <OrderTimer startTime={order.createdAt} className="text-3xl font-bold font-mono text-slate-700" />
          <span className="text-sm text-slate-400 font-medium mt-1">
            {new Date(order.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>

      {/* Notes */}
      {order.notes && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <div className="text-[10px] font-bold text-amber-800 uppercase tracking-widest mb-1">
            {t('cart.specialInstructions') || 'Ghi chú'}
          </div>
          <p className="text-sm font-bold text-amber-900 leading-tight italic">"{order.notes}"</p>
        </div>
      )}

      {/* Items */}
      <div className="bg-gray-50 rounded-lg p-3 space-y-2">
        {order.items.map((item: any) => {
          const modNames = item.modifiers?.map((m: any) => m.modifierOption?.name ?? m.name).filter(Boolean) ?? [];
          return (
            <div key={item.id} className="flex items-baseline gap-3">
              <span className="font-black text-slate-800 text-xl">x{item.quantity}</span>
              <div className="flex-1">
                <span className="font-semibold text-slate-700">{item.product?.name ?? 'Unknown'}</span>
                {modNames.length > 0 && (
                  <div className="text-xs text-slate-500 italic">{modNames.join(', ')}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-auto pt-2">
        <button
          onClick={() => updateStatus(order.id, 'ACCEPTED')}
          className="flex-1 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold uppercase tracking-wide shadow-sm transition-all"
        >
          {t('waiter.accept')}
        </button>
        <button
          onClick={() => updateStatus(order.id, 'REJECTED')}
          className="flex-1 py-3 bg-red-500 hover:bg-red-400 text-white rounded-xl font-bold uppercase tracking-wide shadow-sm transition-all"
        >
          {t('waiter.reject')}
        </button>
      </div>
    </div>
  );
}

function ReadyOrderCard({ order, updateStatus, t }: any) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-green-200 p-5 flex flex-col gap-4 hover:shadow-md transition-shadow animate-pulse">
      {/* Header */}
      <div className="flex justify-between items-start pb-4 border-b border-dashed border-green-200">
        <div>
          <div className="text-sm font-bold text-green-600 uppercase tracking-wider mb-1">{t('waiter.table')}</div>
          <div className="text-5xl font-black text-green-700 leading-none">{order.table?.tableNumber || "?"}</div>
        </div>
        <div className="flex flex-col items-end">
          <OrderTimer startTime={order.createdAt} className="text-3xl font-bold font-mono text-green-700" />
          <span className="text-sm text-green-500 font-medium mt-1">
            {new Date(order.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>

      {/* Notes */}
      {order.notes && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <div className="text-[10px] font-bold text-amber-800 uppercase tracking-widest mb-1">
            {t('cart.specialInstructions') || 'Ghi chú'}
          </div>
          <p className="text-sm font-bold text-amber-900 leading-tight italic">"{order.notes}"</p>
        </div>
      )}

      {/* Items */}
      <div className="bg-green-50 rounded-lg p-3 space-y-2">
        {order.items.map((item: any) => {
          const modNames = item.modifiers?.map((m: any) => m.modifierOption?.name ?? m.name).filter(Boolean) ?? [];
          return (
            <div key={item.id} className="flex items-baseline gap-3">
              <span className="font-black text-green-800 text-xl">x{item.quantity}</span>
              <div className="flex-1">
                <span className="font-semibold text-green-700">{item.product?.name ?? 'Unknown'}</span>
                {modNames.length > 0 && (
                  <div className="text-xs text-green-600 italic">{modNames.join(', ')}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Action */}
      <button
        onClick={() => updateStatus(order.id, 'SERVED')}
        className="w-full py-4 bg-green-600 hover:bg-green-500 text-white rounded-xl text-lg font-bold uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2"
      >
        {t('waiter.serveNow')}
      </button>
    </div>
  );
}

function ServedOrderCard({ order, updateStatus, handleOpenBill, t }: any) {
  const rawTotal = Number(order.totalAmount);
  let finalTotal = rawTotal;
  const dVal = Number(order.discountValue || 0);
  if (order.discountType === 'PERCENT') finalTotal = rawTotal - (rawTotal * dVal / 100);
  else if (order.discountType === 'FIXED') finalTotal = rawTotal - dVal;
  finalTotal = Math.max(0, finalTotal);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-5 flex flex-col gap-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-start pb-4 border-b border-dashed border-blue-200">
        <div>
          <div className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-1">{t('waiter.table')}</div>
          <div className="text-5xl font-black text-blue-700 leading-none">{order.table?.tableNumber || "?"}</div>
        </div>
        <div className="flex flex-col items-end">
          {finalTotal < rawTotal && (
            <div className="text-xs text-gray-400 line-through">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(rawTotal)}
            </div>
          )}
          <span className="text-2xl font-bold text-blue-600">
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(finalTotal)}
          </span>
        </div>
      </div>

      {/* Items Summary */}
      <div className="bg-blue-50 rounded-lg p-3">
        <div className="text-sm text-blue-700 line-clamp-2">
          {order.items.map((i: any) => {
            const mods = i.modifiers?.map((m: any) => m.modifierOption?.name ?? m.name).filter(Boolean) ?? [];
            return mods.length ? `${i.product?.name ?? 'Unknown'} (${mods.join(', ')})` : (i.product?.name ?? 'Unknown');
          }).join(", ")}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2 mt-auto">
        <button
          onClick={() => handleOpenBill(order)}
          className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold uppercase tracking-wide shadow-sm transition-all"
        >
          {t('waiter.viewBill')}
        </button>
        <button
          onClick={() => updateStatus(order.id, 'COMPLETED')}
          className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold uppercase tracking-wide shadow-sm transition-all"
        >
          {t('waiter.completePayment')}
        </button>
      </div>
    </div>
  );
}
