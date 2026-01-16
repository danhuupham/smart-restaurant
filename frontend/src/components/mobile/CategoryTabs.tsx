"use client";

interface CategoryTabsProps {
    categories: string[];
    activeCategory: string;
    onSelect: (category: string) => void;
}

export default function CategoryTabs({ categories, activeCategory, onSelect }: CategoryTabsProps) {
    return (
        <div className="flex overflow-x-auto gap-2 px-4 py-3 no-scrollbar scroll-smooth">
            {categories.map((cat) => (
                <button
                    key={cat}
                    onClick={() => onSelect(cat)}
                    className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeCategory === cat
                            ? "bg-[#e74c3c] text-white shadow-md"
                            : "bg-white text-gray-600 border border-gray-100 hover:bg-gray-50"
                        }`}
                >
                    {cat}
                </button>
            ))}
        </div>
    );
}
