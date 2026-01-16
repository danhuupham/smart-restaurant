"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useTableStore } from "@/store/useTableStore";

export default function TableSync() {
    const searchParams = useSearchParams();
    const tableIdFromUrl = searchParams.get("tableId");
    const { setTableId } = useTableStore();

    useEffect(() => {
        if (tableIdFromUrl) {
            setTableId(tableIdFromUrl);
        }
    }, [tableIdFromUrl, setTableId]);

    return null;
}
