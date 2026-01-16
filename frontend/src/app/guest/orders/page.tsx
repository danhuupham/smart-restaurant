"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Order, OrderStatus } from "@/types";
import { ordersApi } from "@/lib/api/orders";
import Header from "@/components/mobile/Header";
import Link from "next/link";
import PaymentModal from "@/components/guest/PaymentModal";
import toast from "react-hot-toast";

const getStatusColor = (status: OrderStatus) => {
    switch (status) {
        case "PENDING":
            return "text-yellow-600 bg-yellow-100";
        case "ACCEPTED":
            return "text-blue-600 bg-blue-100";
        case "PREPARING":
            return "text-orange-600 bg-orange-100";
        case "READY":
            return "text-green-600 bg-green-100";
        case "SERVED":
            return "text-purple-600 bg-purple-100";
        case "COMPLETED":
            return "text-gray-600 bg-gray-100";
        case "REJECTED":
        case "CANCELLED":
            return "text-red-600 bg-red-100";
        default:
            return "text-gray-600 bg-gray-100";
    }
};

const formatPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(price);

function OrdersContent() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    const searchParams = useSearchParams();
    const tableId = searchParams.get("tableId");

    const fetchOrders = async () => {
        if (!tableId) return;
        try {
            const data = await ordersApi.getByTable(tableId);
            setOrders(data);
        } catch (error) {
            console.error("Failed to fetch orders", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
        // Poll every 10 seconds
        const interval = setInterval(fetchOrders, 10000);
        return () => clearInterval(interval);
    }, [tableId]);

    const sessionTotal = Array.isArray(orders)
        ? orders.reduce((sum, order) => sum + Number(order.totalAmount), 0)
        : 0;

    // Filter unpaid orders (not COMPLETED or CANCELLED)
    const unpaidOrders = orders.filter(o => o.status !== 'COMPLETED' && o.status !== 'CANCELLED' && o.status !== 'REJECTED');
    const unpaidTotal = unpaidOrders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
    const canPay = unpaidTotal > 0;

    const handlePaymentSuccess = async () => {
        // Mark all unpaid orders as COMPLETED
        try {
            await Promise.all(unpaidOrders.map(order =>
                fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/orders/${order.id}/status`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: 'COMPLETED' })
                })
            ));
            toast.success("Đã thanh toán tất cả đơn hàng!");
            fetchOrders();
        } catch (error) {
            console.error("Payment update failed", error);
            toast.error("Thanh toán thành công nhưng lỗi cập nhật trạng thái.");
        }
    };

    return (
        <div className="p-4 safe-area-pb space-y-6">
            <Header
                title="Your Orders"
                showBack
                backUrl={`/guest?tableId=${tableId || ""}`}
                tableId={tableId}
            />

            {/* Session Summary */}
            {orders.length > 0 && (
                <div className="bg-gradient-to-r from-[#e74c3c] to-[#c0392b] text-white p-5 rounded-2xl shadow-lg">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <div className="text-sm opacity-90">Current Session Total</div>
                            <div className="text-3xl font-bold">
                                {formatPrice(sessionTotal)}
                            </div>
                        </div>
                        {canPay ? (
                            <button
                                onClick={() => setIsPaymentModalOpen(true)}
                                className="bg-white text-[#e74c3c] px-4 py-2 rounded-full font-bold shadow-sm active:scale-95 transition-transform flex items-center gap-2"
                            >
                                💳 Pay All
                            </button>
                        ) : (
                            <span className="bg-white/20 px-3 py-1 rounded text-sm">Paid ✅</span>
                        )}
                    </div>
                    <div className="flex gap-4 border-t border-white/30 pt-3 text-sm font-medium">
                        <span>📦 {orders.length} Orders</span>
                        <span>
                            🍽️{" "}
                            {orders.reduce(
                                (acc, order) =>
                                    acc + order.items.reduce((s, i) => s + i.quantity, 0),
                                0
                            )}{" "}
                            Items
                        </span>
                    </div>
                </div>
            )}

            {/* Orders List */}
            {loading ? (
                <div className="text-center py-10">Loading orders...</div>
            ) : orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                    <span className="text-4xl mb-3">📋</span>
                    <p>No orders yet.</p>
                    <Link
                        href={`/guest?tableId=${tableId || ""}`}
                        className="mt-4 text-[#e74c3c] font-bold"
                    >
                        Go to Menu
                    </Link>
                </div>
            ) : (
                orders.map((order) => (
                    <div key={order.id} className="bg-white rounded-xl shadow-sm p-4">
                        {/* Order Header */}
                        <div className="flex justify-between items-start mb-4 border-b pb-3">
                            <div>
                                <div className="font-bold text-gray-800">
                                    Order #{order.id.slice(0, 8)}
                                </div>
                                <div className="text-xs text-gray-500">
                                    {new Date(order.createdAt).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </div>
                            </div>
                            <span
                                className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(
                                    order.status
                                )}`}
                            >
                                {order.status}
                            </span>
                        </div>

                        {/* Items */}
                        <div className="space-y-3">
                            {order.items.map((item) => (
                                <div key={item.id} className="flex justify-between text-sm">
                                    <div className="flex gap-3">
                                        <span className="font-bold text-gray-500 w-5">
                                            {item.quantity}x
                                        </span>
                                        <div>
                                            <div className="text-gray-800 font-medium">
                                                {item.product.name}
                                            </div>
                                            {item.modifiers && item.modifiers.length > 0 && (
                                                <div className="text-xs text-gray-500">
                                                    {item.modifiers
                                                        .map((m) => m.modifierOption.name)
                                                        .join(", ")}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <span className="text-gray-500">
                                        {/* Item specific status can be here if we track it */}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Total */}
                        <div className="flex justify-between items-center mt-4 pt-3 border-t">
                            <span className="font-bold text-gray-700">Order Total</span>
                            <span className="font-bold text-lg text-gray-900">
                                {formatPrice(Number(order.totalAmount))}
                            </span>
                        </div>
                    </div>
                ))
            )}

            {/* Browse Menu Button */}
            <div className="text-center pt-4">
                <Link href={`/guest?tableId=${tableId || ""}`}>
                    <button className="bg-[#e74c3c]/10 text-[#e74c3c] font-bold py-3 px-8 rounded-full hover:bg-opacity-20 transition-colors">
                        🍽️ Browse Menu
                    </button>
                </Link>
            </div>

            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                amount={unpaidTotal}
                onSuccess={handlePaymentSuccess}
            />
        </div>
    );
}

export default function OrdersPage() {
    return (
        <main className="min-h-screen bg-[#f5f6fa]">
            <Suspense fallback={<div>Loading...</div>}>
                <OrdersContent />
            </Suspense>
        </main>
    );
}
