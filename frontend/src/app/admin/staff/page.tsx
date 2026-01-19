"use client";

import { useState } from "react";
import useSWR from "swr";
import { usersApi, User } from "@/lib/api/users";
import Button from "@/components/ui/Button";
import * as Icons from "lucide-react";
import StaffForm from "./StaffForm";
import EditStaffModal from "./EditStaffModal";
import { useI18n } from "@/contexts/I18nContext";
import toast from "react-hot-toast";

const fetcher = () => usersApi.getAll();

export default function StaffPage() {
    const { t } = useI18n();
    const { data: users, error, mutate } = useSWR<User[]>("users", fetcher);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const waiters = users?.filter(u => u.role === 'WAITER') || [];
    const kitchenStaff = users?.filter(u => u.role === 'KITCHEN') || [];
    const admins = users?.filter(u => u.role === 'ADMIN') || [];

    const handleAddNew = () => {
        setIsFormOpen(true);
    };

    const handleFormClose = () => {
        setIsFormOpen(false);
        mutate();
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setIsEditModalOpen(true);
    };

    const handleEditClose = () => {
        setIsEditModalOpen(false);
        setEditingUser(null);
    };

    const handleEditSuccess = () => {
        mutate();
    };

    const handleToggleStatus = async (user: User) => {
        try {
            await usersApi.update(user.id, { isActive: !user.isActive });
            toast.success(t('staff.toggleStatusSuccess').replace('{name}', user.name));
            mutate();
        } catch (error: any) {
            toast.error(error.message || 'Failed to update status');
        }
    };

    const handleDelete = async (userId: string, userName: string) => {
        if (!confirm(t('staff.confirmDelete').replace('{name}', userName))) {
            return;
        }

        try {
            await usersApi.delete(userId);
            toast.success(t('staff.deleteSuccess').replace('{name}', userName));
            mutate();
        } catch (error: any) {
            console.error('Delete user error:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to delete user';
            toast.error(`Error: ${errorMessage}`);
        }
    };

    if (error) return <div>{t('common.error')}</div>;
    if (!users) return <div>{t('common.loading')}</div>;

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">{t('staff.title')}</h1>
                    <p className="text-sm text-gray-700">{t('staff.subtitle')}</p>
                </div>
                <Button onClick={handleAddNew}>
                    <Icons.PlusCircle className="mr-2 h-4 w-4" /> {t('staff.addNew')}
                </Button>
            </div>

            {isFormOpen && (
                <StaffForm onClose={handleFormClose} />
            )}

            {editingUser && (
                <EditStaffModal
                    user={editingUser}
                    isOpen={isEditModalOpen}
                    onClose={handleEditClose}
                    onSuccess={handleEditSuccess}
                />
            )}

            <div className="space-y-12">
                {/* Waiters Section */}
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
                            <Icons.Users className="h-6 w-6" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 leading-none">
                            {t('role.waiter')}
                        </h2>
                        <span className="bg-gray-100 text-gray-500 text-sm px-3 py-1 rounded-full font-medium border border-gray-200">
                            {waiters.length}
                        </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {waiters.map(user => (
                            <StaffCard key={user.id} user={user} icon={<Icons.User className="h-5 w-5" />} onEdit={handleEdit} onDelete={handleDelete} onToggleStatus={handleToggleStatus} />
                        ))}
                        {waiters.length === 0 && <p className="text-gray-400 italic text-sm py-4">{t('common.noData')}</p>}
                    </div>
                </section>

                {/* Kitchen Section */}
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-orange-100 text-orange-700 rounded-lg">
                            <Icons.UtensilsCrossed className="h-6 w-6" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 leading-none">
                            {t('role.kitchen')}
                        </h2>
                        <span className="bg-gray-100 text-gray-500 text-sm px-3 py-1 rounded-full font-medium border border-gray-200">
                            {kitchenStaff.length}
                        </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {kitchenStaff.map(user => (
                            <StaffCard key={user.id} user={user} icon={<Icons.ChefHat className="h-5 w-5" />} onEdit={handleEdit} onDelete={handleDelete} onToggleStatus={handleToggleStatus} />
                        ))}
                        {kitchenStaff.length === 0 && <p className="text-gray-400 italic text-sm py-4">{t('common.noData')}</p>}
                    </div>
                </section>

                {/* Admins Section */}
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-red-100 text-red-700 rounded-lg">
                            <Icons.ShieldCheck className="h-6 w-6" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 leading-none">
                            {t('role.admin')}
                        </h2>
                        <span className="bg-gray-100 text-gray-500 text-sm px-3 py-1 rounded-full font-medium border border-gray-200">
                            {admins.length}
                        </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {admins.map(user => (
                            <StaffCard key={user.id} user={user} icon={<Icons.Lock className="h-5 w-5" />} onEdit={handleEdit} onDelete={handleDelete} onToggleStatus={handleToggleStatus} />
                        ))}
                        {admins.length === 0 && <p className="text-gray-400 italic text-sm py-4">{t('common.noData')}</p>}
                    </div>
                </section>
            </div>
        </div>
    );
}

function StaffCard({ user, icon, onEdit, onDelete, onToggleStatus }: {
    user: User;
    icon: React.ReactNode;
    onEdit: (user: User) => void;
    onDelete: (userId: string, userName: string) => void;
    onToggleStatus: (user: User) => void;
}) {
    const { t } = useI18n();
    return (
        <div className={`group p-5 rounded-2xl border transition-all duration-300 hover:shadow-lg ${user.isActive ? 'bg-white border-gray-200' : 'bg-gray-50/50 border-gray-200 grayscale opacity-80'}`}>
            <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-xl border ${user.isActive ? 'bg-indigo-50 border-indigo-100 text-indigo-600' : 'bg-gray-100 border-gray-200 text-gray-400'}`}>
                            {icon}
                        </div>
                        <div className="flex flex-col min-w-0">
                            <h3 className="font-bold text-gray-900 truncate flex items-center gap-2">
                                {user.name}
                                {!user.isActive && (
                                    <span className="bg-red-50 text-red-600 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-tighter">
                                        {t('staff.inactive')}
                                    </span>
                                )}
                            </h3>
                            <div className="flex items-center gap-1.5 text-gray-500 text-xs mt-0.5">
                                <Icons.Key className="h-3 w-3" />
                                <span className="uppercase font-bold tracking-widest opacity-80">{user.role}</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1.5 mt-4">
                        <div className="text-gray-600 text-sm flex items-center gap-2.5 px-1">
                            <Icons.Mail className="h-3.5 w-3.5 text-gray-400" />
                            <span className="truncate">{user.email}</span>
                        </div>
                        {user.phone && (
                            <div className="text-gray-600 text-sm flex items-center gap-2.5 px-1">
                                <Icons.Phone className="h-3.5 w-3.5 text-gray-400" />
                                <span>{user.phone}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between">
                <div className="flex gap-1">
                    <button
                        onClick={() => onEdit(user)}
                        className="text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 p-2.5 rounded-xl transition-all"
                        title={t('staff.edit')}
                    >
                        <Icons.UserPen className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => onDelete(user.id, user.name)}
                        className="text-gray-600 hover:text-red-600 hover:bg-red-50 p-2.5 rounded-xl transition-all"
                        title={t('staff.delete')}
                    >
                        <Icons.Trash2 className="h-4 w-4" />
                    </button>
                </div>

                <button
                    onClick={() => onToggleStatus(user)}
                    className={`flex items-center gap-2 text-xs font-black px-4 py-2.5 rounded-xl transition-all active:scale-95 border-b-2 ${user.isActive
                            ? 'text-amber-800 bg-amber-50 hover:bg-amber-100 border-amber-200'
                            : 'text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border-emerald-200'
                        }`}
                >
                    {user.isActive ? (
                        <>
                            <Icons.UserX className="h-4 w-4" />
                            <span className="uppercase tracking-wide">{t('staff.deactivate')}</span>
                        </>
                    ) : (
                        <>
                            <Icons.UserCheck className="h-4 w-4" />
                            <span className="uppercase tracking-wide">{t('staff.activate')}</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
