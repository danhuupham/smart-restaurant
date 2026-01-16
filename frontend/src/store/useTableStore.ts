import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TableState {
    tableId: string | null;
    setTableId: (id: string | null) => void;
}

export const useTableStore = create<TableState>()(
    persist(
        (set) => ({
            tableId: null,
            setTableId: (id) => set({ tableId: id }),
        }),
        {
            name: 'smart-restaurant-table',
        }
    )
);
