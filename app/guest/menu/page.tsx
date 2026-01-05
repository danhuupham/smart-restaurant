// app/guest/menu/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useProductStore } from '@/store/useProductStore';
import { useCartStore } from '@/store/useCartStore';
import ProductCard from '@/components/guest/ProductCard';
import { ShoppingCart, Utensils, Search } from 'lucide-react';

export default function GuestMenuPage() {
  const { products, categories, fetchProducts, isLoading } = useProductStore();
  const { items } = useCartStore();
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Gọi API lấy menu ngay khi trang vừa mở
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Tự động chọn danh mục đầu tiên
  useEffect(() => {
    if (categories.length > 0 && activeCategory === 'all') {
      setActiveCategory(categories[0].id);
    }
  }, [categories]);

  // Lọc món ăn theo danh mục đang chọn
  const filteredProducts = activeCategory === 'all' 
    ? products 
    : products.filter(p => p.categoryId === activeCategory);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header cố định phía trên */}
      <header className="bg-white shadow-sm sticky top-0 z-20">
        <div className="flex justify-between items-center p-4">
          <div className="flex items-center gap-2">
            <div className="bg-orange-600 p-2 rounded-lg shadow-sm">
              <Utensils className="text-white" size={20} />
            </div>
            <div>
              <h1 className="font-bold text-lg text-gray-800 leading-tight">Smart Restaurant</h1>
              <p className="text-xs text-gray-500">Bàn T-01</p>
            </div>
          </div>
          
          <div className="relative cursor-pointer hover:opacity-80 transition-opacity">
            <div className="p-2 bg-orange-50 rounded-full text-orange-600">
              <ShoppingCart size={24} />
              {items.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full border-2 border-white">
                  {items.length}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Thanh danh mục cuộn ngang */}
        <div className="px-4 pb-3 overflow-x-auto hide-scrollbar">
          <div className="flex space-x-2">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${
                  activeCategory === cat.id
                    ? 'bg-orange-600 text-white border-orange-600 shadow-md'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Danh sách món ăn */}
      <main className="p-4 container mx-auto max-w-5xl">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <Search className="text-gray-400" size={32} />
            </div>
            <p className="text-gray-500">Chưa có món ăn nào trong danh mục này</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}