"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types";
import { useI18n } from "@/contexts/I18nContext";
import { ArrowLeft, Search, UtensilsCrossed } from "lucide-react";
import CategoryTabs from "@/components/mobile/CategoryTabs";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const formatPrice = (price: number | string) => {
    return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(Number(price));
};

function MenuContent() {
    const { t } = useI18n();
    const [products, setProducts] = useState<Product[]>([]);
    const [activeCategory, setActiveCategory] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);

    // Fetch products
    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const endpoint = searchQuery.trim()
                    ? `/products/search?q=${encodeURIComponent(searchQuery)}`
                    : '/products';

                const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'}${endpoint}`, {
                    cache: "no-store",
                });

                if (!res.ok) throw new Error("Failed to fetch products");

                const data = await res.json();
                setProducts(data);
            } catch (error) {
                console.error("Error loading menu:", error);
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(() => {
            fetchProducts();
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    // Extract categories
    const categories = useMemo(() => {
        const cats = new Set(products.map((p) => p.category?.name || "Other"));
        return [t('menu.allCategories'), ...Array.from(cats).sort()];
    }, [products, t]);

    // Filter products
    const filteredProducts = useMemo(() => {
        return products.filter((product) => {
            return activeCategory === "" ||
                (product.category?.name || "Other") === activeCategory;
        });
    }, [products, activeCategory]);

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/" className="p-2 -ml-2 text-gray-600 hover:text-gray-900">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div className="font-bold text-lg flex items-center gap-2 text-orange-600">
                            <UtensilsCrossed className="w-5 h-5" />
                            <span>{t('menu.title')}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <LanguageSwitcher />
                        <Link
                            href="/tables"
                            className="text-sm font-medium bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                        >
                            {t('cart.startOrdering') || "Đặt Món"}
                        </Link>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-6 max-w-4xl">
                {/* Search */}
                <div className="mb-6 relative">
                    <input
                        type="text"
                        placeholder={t('menu.searchPlaceholder')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 shadow-sm bg-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none text-slate-800 placeholder:text-slate-500 transition-colors"
                    />
                    <Search className="absolute left-3 top-3.5 text-slate-400 w-5 h-5" />
                </div>

                {/* Categories */}
                <div className="mb-8">
                    <CategoryTabs
                        categories={categories}
                        activeCategory={activeCategory === "" ? t('menu.allCategories') : activeCategory}
                        onSelect={(cat) => setActiveCategory(cat === t('menu.allCategories') ? "" : cat)}
                    />
                </div>

                {/* Product Grid */}
                {loading ? (
                    <div className="text-center py-12 text-gray-500">{t('common.loading')}</div>
                ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">{t('menu.noItems')}</div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                        {filteredProducts.map((product) => (
                            <div key={product.id} className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow flex gap-4">
                                <div className="relative w-28 h-28 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                                    <Image
                                        src={product.images.find((img) => img.isPrimary)?.url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"}
                                        alt={product.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div className="flex-1 flex flex-col">
                                    <div className="flex-1">
                                        <h3 className="font-bold text-gray-900 mb-1 line-clamp-2">{product.name}</h3>
                                        <p className="text-xs text-gray-500 line-clamp-2">{product.description || t('menu.noDescription') || "..."}</p>
                                    </div>
                                    <div className="mt-2 flex items-center justify-between">
                                        <span className="font-bold text-orange-600 text-lg">
                                            {formatPrice(product.price)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

export default function PublicMenuPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <MenuContent />
        </Suspense>
    );
}
