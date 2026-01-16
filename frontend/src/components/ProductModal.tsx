"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Product, ModifierOption, ProductModifierGroup, Review } from "@/types"
import { useCartStore } from "@/store/useCartStore";
import toast from "react-hot-toast";

interface ProductModalProps {
    product: Product | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
    const [quantity, setQuantity] = useState(1);
    const [selectedModifiers, setSelelctedModifiers] = useState<Record<string, ModifierOption[]>>({});
    const [reviews, setReviews] = useState<Review[]>([]);
    const addToCart = useCartStore((state) => state.addToCart);

    useEffect(() => {
        if (isOpen && product) {
            setQuantity(1);
            setSelelctedModifiers({});

            // Fetch reviews
            fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'}/reviews/product/${product.id}`)
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) setReviews(data);
                    else setReviews([]);
                })
                .catch(err => console.error("Failed to fetch reviews", err));
        }
    }, [isOpen, product]);

    if (!isOpen || !product) return null;

    const handleModifierToggle = (group: ProductModifierGroup["modifierGroup"], option: ModifierOption) => {
        const groupId = group.id;
        const currentSelected = selectedModifiers[groupId] || [];
        const isSingle = group.selectionType === "SINGLE";

        let newSelected: ModifierOption[] = [];

        if (isSingle) {
            newSelected = [option];
        } else {
            const exists = currentSelected.find((item) => item.id == option.id);
            if (exists) {
                newSelected = currentSelected.filter((item) => item.id !== option.id);
            } else {
                if (group.maxSelections && currentSelected.length >= group.maxSelections) {
                    toast(`Just choose at most ${group.maxSelections} option`)
                    return;
                }
                newSelected = [...currentSelected, option];
            }
        }

        setSelelctedModifiers({
            ...selectedModifiers,
            [groupId]: newSelected,
        });
    };

    const calculateTotal = () => {
        const basePrice = Number(product.price);
        let modifiersPrice = 0;
        Object.values(selectedModifiers).forEach((options) => {
            options.forEach((opt) => {
                modifiersPrice += Number(opt.priceAdjustment);
            })
        });
        return (basePrice + modifiersPrice) * quantity;
    };

    const handleAddToCart = () => {
        const missingRequired = product.modifierGroups.some(g =>
            g.modifierGroup.isRequired && (!selectedModifiers[g.modifierGroup.id] || selectedModifiers[g.modifierGroup.id].length === 0)
        );

        if (missingRequired) {
            toast("Please select all required options");
            return;
        }

        const allModifiers = Object.values(selectedModifiers).flat().map(mod => ({
            modifierOptionId: mod.id,
            name: mod.name,
            price: Number(mod.priceAdjustment)
        }));

        addToCart(product, quantity, allModifiers);
        onClose();

        toast.success("Added to cart!");
    };

    const formatPrice = (price: number | string) => {
        return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(Number(price));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">

                {/* Header: Ảnh món */}
                <div className="relative h-48 w-full shrink-0">
                    <Image
                        src={product.images.find((img) => img.isPrimary)?.url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"}
                        alt={product.name}
                        fill
                        className="object-cover"
                    />
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
                    >
                        ✕
                    </button>
                </div>

                {/* Body: Cuộn được */}
                <div className="p-6 overflow-y-auto flex-1">
                    <h2 className="text-2xl font-bold text-gray-800">{product.name}</h2>
                    <p className="text-gray-600 mt-1">{product.description}</p>

                    {/* Loop qua các nhóm Modifier (Size, Topping...) */}
                    <div className="mt-6 space-y-6">
                        {product.modifierGroups.sort((a, b) => a.displayOrder - b.displayOrder).map((groupWrapper) => {
                            const group = groupWrapper.modifierGroup;
                            return (
                                <div key={group.id}>
                                    <div className="flex justify-between items-center mb-3">
                                        <h3 className="font-bold text-gray-700">
                                            {group.name} {group.isRequired && <span className="text-red-500 text-sm">(Bắt buộc)</span>}
                                        </h3>
                                        <span className="text-xs text-gray-600">
                                            {group.selectionType === 'SINGLE' ? 'Chọn 1' : `Tối đa ${group.maxSelections}`}
                                        </span>
                                    </div>

                                    <div className="space-y-2">
                                        {group.options.map((option) => {
                                            const isSelected = selectedModifiers[group.id]?.some(sel => sel.id === option.id);
                                            return (
                                                <div
                                                    key={option.id}
                                                    className={`flex justify-between items-center p-3 rounded-lg border cursor-pointer transition-all ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                                                        }`}
                                                    onClick={() => handleModifierToggle(group, option)}
                                                >
                                                    <span className="text-gray-700">{option.name}</span>
                                                    <span className="text-sm font-medium text-gray-700">
                                                        {Number(option.priceAdjustment) > 0 ? `+${formatPrice(Number(option.priceAdjustment))}` : ''}
                                                    </span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Reviews Section */}
                    <div className="mt-8 border-t pt-6 mb-4">
                        <div className="flex items-center gap-2 mb-4">
                            <h3 className="font-bold text-lg text-gray-800">Reviews</h3>
                            <span className="text-sm text-gray-500">({reviews.length})</span>
                            {reviews.length > 0 && (
                                <div className="flex items-center text-yellow-500 text-sm font-bold bg-yellow-50 px-2 py-0.5 rounded ml-auto">
                                    <span className="mr-1">★</span>
                                    {(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)}
                                </div>
                            )}
                        </div>

                        {reviews.length === 0 ? (
                            <p className="text-gray-500 italic text-sm text-center py-4 bg-gray-50 rounded-lg">Chưa có đánh giá nào.</p>
                        ) : (
                            <div className="space-y-4">
                                {reviews.map(review => (
                                    <div key={review.id} className="bg-gray-50 p-3 rounded-lg">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">
                                                    {review.user.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-sm text-gray-800">{review.user.name}</div>
                                                    <div className="text-[10px] text-gray-500">
                                                        {new Date(review.createdAt).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex text-yellow-500 text-xs">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <span key={i} className={i < review.rating ? "opacity-100" : "opacity-30"}>★</span>
                                                ))}
                                            </div>
                                        </div>
                                        {review.comment && (
                                            <p className="mt-2 text-sm text-gray-600 leading-relaxed">{review.comment}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>

                {/* Footer: Nút bấm */}
                <div className="p-4 border-t bg-white shrink-0">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center border border-gray-400 rounded-lg">
                            <button
                                className="px-4 py-2 hover:bg-gray-100 font-bold text-gray-900"
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            >-</button>
                            <span className="px-4 font-bold text-gray-900">{quantity}</span>
                            <button
                                className="px-4 py-2 hover:bg-gray-100 font-bold text-gray-900"
                                onClick={() => setQuantity(quantity + 1)}
                            >+</button>
                        </div>
                        <div className="text-xl font-bold text-blue-600">
                            {formatPrice(calculateTotal())}
                        </div>
                    </div>
                    <button
                        onClick={handleAddToCart}
                        className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 active:scale-95 transition-transform"
                    >
                        Thêm vào giỏ hàng
                    </button>
                </div>

            </div>
        </div>
    );
}