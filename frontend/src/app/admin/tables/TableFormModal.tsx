'use client';

import { Table } from '@/types/table';
import { useForm, SubmitHandler } from 'react-hook-form';
import { tablesApi, CreateTablePayload } from '@/lib/api/tables';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog';

const formSchema = z.object({
    tableNumber: z.string().min(1, 'Table number is required'),
    capacity: z.coerce.number().int().min(1, 'Capacity must be at least 1'),
    location: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface TableFormModalProps {
    isOpen: boolean;
    table: Table | null;
    onClose: () => void;
    onSuccess: () => void;
}

export default function TableFormModal({ isOpen, table, onClose, onSuccess }: TableFormModalProps) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            tableNumber: '',
            capacity: 2,
            location: '',
        },
        values: table ? {
            tableNumber: table.tableNumber,
            capacity: table.capacity,
            location: table.location || '',
        } : undefined
    });

    const onSubmit: SubmitHandler<FormData> = async (data) => {
        try {
            if (table) {
                await tablesApi.update(table.id, data);
                toast.success('Table updated successfully');
            } else {
                await tablesApi.create(data as CreateTablePayload);
                toast.success('Table created successfully');
            }
            onSuccess();
            onClose();
            reset();
        } catch (error: any) {
            console.error('Table form error:', error);
            const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
            toast.error(`Error: ${errorMessage}`);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{table ? 'Edit Table' : 'Create New Table'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Table Number</label>
                        <Input placeholder="e.g. T-01" {...register('tableNumber')} />
                        {errors.tableNumber && <p className="text-red-500 text-sm">{errors.tableNumber.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Capacity</label>
                        <Input type="number" placeholder="Number of seats" {...register('capacity')} />
                        {errors.capacity && <p className="text-red-500 text-sm">{errors.capacity.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Location</label>
                        <Input placeholder="e.g. Main Hall, Patio" {...register('location')} />
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Saving...' : 'Save'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
