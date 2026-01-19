import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";

import { DiscountType, Order } from "../../types";
import toast from "react-hot-toast";
import { useReactToPrint } from "react-to-print";

interface BillModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  tableNumber: string;
  onOrderUpdated?: (order: Order) => void;
}

export default function BillModal({ isOpen, onClose, order, tableNumber, onOrderUpdated }: BillModalProps) {
  const billRef = useRef<HTMLDivElement>(null);
  const [discountType, setDiscountType] = useState<DiscountType | 'NONE'>('NONE');
  const [discountValue, setDiscountValue] = useState<number>(0);

  const handlePrint = useReactToPrint({
    contentRef: billRef,
    documentTitle: `Bill-Table-${tableNumber}-${order?.id}`,
    onAfterPrint: () => toast.success("Hóa đơn đã được in!"),
  });

  useEffect(() => {
    if (order) {
      setDiscountType(order.discountType ?? 'NONE');
      setDiscountValue(Number(order.discountValue ?? 0));
    }
  }, [order]);

  const subtotal = useMemo(() => Number(order?.totalAmount ?? 0), [order]);

  const discountAmount = useMemo(() => {
    if (!order || discountType === 'NONE' || discountValue <= 0) return 0;
    if (discountType === 'PERCENT') {
      const percent = Math.min(Math.max(discountValue, 0), 100);
      return (subtotal * percent) / 100;
    }
    // FIXED
    return Math.min(Math.max(discountValue, 0), subtotal);
  }, [discountType, discountValue, order, subtotal]);

  const finalTotal = useMemo(() => Math.max(0, subtotal - discountAmount), [subtotal, discountAmount]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const applyDiscount = async () => {
    if (!order) return;

    if (discountValue < 0) {
      toast.error("Giá trị giảm giá không hợp lệ");
      return;
    }

    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
    let payload: { discountType: DiscountType | null; discountValue: number } = {
      discountType: null,
      discountValue: 0,
    };

    if (discountType !== 'NONE' && discountValue > 0) {
      if (discountType === 'PERCENT' && discountValue > 100) {
        toast.error("Phần trăm giảm tối đa 100%");
        return;
      }

      const fixedValue = discountType === 'FIXED' ? Math.min(discountValue, subtotal) : discountValue;
      payload = {
        discountType,
        discountValue: fixedValue,
      };
    }

    try {
      const res = await fetch(`${baseUrl}/orders/${order.id}/discount`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error?.message || "Không thể áp dụng giảm giá");
      }

      const updated = await res.json();
      setDiscountType(updated.discountType ?? 'NONE');
      setDiscountValue(Number(updated.discountValue ?? 0));
      onOrderUpdated?.(updated);
      toast.success("Đã áp dụng giảm giá");
    } catch (error: any) {
      toast.error(error?.message || "Có lỗi khi áp dụng giảm giá");
    }
  };

  if (!order) return null;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 text-center mb-4"
                >
                  Hóa đơn tạm tính - Bàn {tableNumber}
                </Dialog.Title>

                {/* Printable Bill Content */}
                <div ref={billRef} className="print:p-8">
                  {/* Header (only visible when printing) */}
                  <div className="hidden print:block text-center mb-6">
                    <h1 className="text-2xl font-bold">SMART RESTAURANT</h1>
                    <p className="text-sm text-gray-600">123 Restaurant Street, City</p>
                    <p className="text-sm text-gray-600">Tel: (123) 456-7890</p>
                    <hr className="my-4" />
                    <h2 className="text-xl font-semibold">HÓA ĐƠN THANH TOÁN</h2>
                    <p className="text-sm">Bàn: {tableNumber}</p>
                    <p className="text-sm">Ngày: {new Date().toLocaleString('vi-VN')}</p>
                  </div>

                  <div className="mt-2 space-y-4">
                    {/* Order Items List */}
                    <div className="border-t border-b border-gray-200 py-4 max-h-60 overflow-y-auto print:max-h-none">
                      {order.items.map((item) => {
                        const modNames = item.modifiers?.map((m) => m.modifierOption.name).join(", ");
                        return (
                          <div key={item.id} className="flex justify-between items-start py-2">
                            <div className="flex-1">
                              <div className="font-medium text-gray-800">
                                {item.quantity}x {item.product.name}
                              </div>
                              {modNames && (
                                <div className="text-xs text-gray-500">{modNames}</div>
                              )}
                            </div>
                            <div className="font-medium text-gray-800">
                              {formatCurrency(item.totalPrice)}
                            </div>
                          </div>
                        );
                      })}
                    </div>



                    {/* Totals */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm font-semibold text-gray-700">
                        <span>Tổng tạm tính:</span>
                        <span>{formatCurrency(subtotal)}</span>
                      </div>
                      {discountAmount > 0 && (
                        <div className="flex justify-between items-center text-sm font-semibold text-red-600">
                          <span>Giảm giá:</span>
                          <span>- {formatCurrency(discountAmount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center text-lg font-bold text-blue-600 print:text-black">
                        <span>Khách cần thanh toán:</span>
                        <span>{formatCurrency(finalTotal)}</span>
                      </div>
                    </div>



                    {/* Footer (only visible when printing) */}
                    <div className="hidden print:block text-center mt-8 pt-4 border-t">
                      <p className="text-sm">Cảm ơn quý khách!</p>
                      <p className="text-sm">Hẹn gặp lại!</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons (hide when printing) */}
                <div className="mt-6 flex gap-3 print:hidden">
                  <button
                    type="button"
                    className="flex-1 justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    onClick={handlePrint}
                  >
                    🖨️ In Hóa Đơn
                  </button>
                  <button
                    type="button"
                    className="flex-1 justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                    onClick={onClose}
                  >
                    Đóng
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
