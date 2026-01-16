"use client";

import Link from "next/link";

interface HeaderProps {
    title: string;
    showBack?: boolean;
    backUrl?: string;
    tableId?: string | null;
}

export default function Header({ title, showBack, backUrl, tableId }: HeaderProps) {
    return (
        <div className="sticky top-0 bg-white z-40 px-4 py-3 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
                {showBack && (
                    <Link href={backUrl || "/guest"} className="text-2xl text-gray-600">
                        ←
                    </Link>
                )}
                <span className="text-lg font-bold text-gray-800">{title}</span>
            </div>
            {tableId && (
                <span className="text-sm font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    Table 5
                </span>
            )}
        </div>
    );
}
