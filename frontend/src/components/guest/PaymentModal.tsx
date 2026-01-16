"use client";

import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import toast from "react-hot-toast";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function CheckoutForm({ amount, onSuccess, onClose }: { amount: number, onSuccess: () => void, onClose: () => void }) {
    const stripe = useStripe();
    const elements = useElements();
    const [errorMessage, setErrorMessage] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!stripe || !elements) return;

        setIsProcessing(true);

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: window.location.href, // In a real app, page to redirect after payment
            },
            redirect: 'if_required'
        });

        if (error) {
            setErrorMessage(error.message ?? "Payment failed");
            setIsProcessing(false);
        } else {
            // Payment successful
            toast.success("Thanh toán thành công! (Stripe Test)");
            onSuccess();
            onClose();
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <PaymentElement />
            {errorMessage && <div className="text-red-500 text-sm mt-2">{errorMessage}</div>}
            <button
                disabled={!stripe || isProcessing}
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded disabled:opacity-50"
            >
                {isProcessing ? "Đang xử lý..." : `Thanh toán ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)}`}
            </button>
        </form>
    );
}

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    amount: number;
    onSuccess: () => void;
}

export default function PaymentModal({ isOpen, onClose, amount, onSuccess }: PaymentModalProps) {
    const [clientSecret, setClientSecret] = useState("");
    const [isMock, setIsMock] = useState(false);

    useEffect(() => {
        if (isOpen && amount > 0) {
            // Create PaymentIntent as soon as the modal opens
            fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/payments/create-intent`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount }),
            })
                .then((res) => res.json())
                .then((data) => {
                    setClientSecret(data.clientSecret);
                    setIsMock(data.isMock);
                })
                .catch((err) => console.error("Error creating payment intent", err));
        }
    }, [isOpen, amount]);

    const handleMockPayment = () => {
        toast.success("Thanh toán giả lập thành công!");
        onSuccess();
        onClose();
    };

    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <DialogPanel className="w-full max-w-md rounded bg-white p-6 shadow-xl">
                    <DialogTitle className="text-lg font-bold mb-4">Thanh Toán {isMock ? "(Giả Lập)" : "Online (Stripe)"}</DialogTitle>

                    {isMock ? (
                        <div className="text-center py-6">
                            <div className="mb-4 text-yellow-600 bg-yellow-50 p-3 rounded">
                                ⚠️ <strong>Chế độ Test:</strong> Không cần thẻ tín dụng.
                            </div>
                            <p className="mb-6">Số tiền: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)}</p>
                            <button
                                onClick={handleMockPayment}
                                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded shadow-lg"
                            >
                                ✅ Giả lập "Thanh toán thành công"
                            </button>
                        </div>
                    ) : clientSecret ? (
                        <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
                            <CheckoutForm amount={amount} onSuccess={onSuccess} onClose={onClose} />
                        </Elements>
                    ) : (
                        <p>Đang khởi tạo cổng thanh toán...</p>
                    )}

                    <button onClick={onClose} className="mt-4 text-sm text-gray-500 hover:underline w-full text-center">
                        Hủy bỏ
                    </button>
                </DialogPanel>
            </div>
        </Dialog>
    );
}
