"use client";

import { useState, useEffect } from "react";
import { usersApi, User, UpdateUserDto } from "@/lib/api/users";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import toast from "react-hot-toast";
import { useI18n } from "@/contexts/I18nContext";
import * as Icons from "lucide-react";

interface EditStaffModalProps {
    user: User | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function EditStaffModal({ user, isOpen, onClose, onSuccess }: EditStaffModalProps) {
    const { t } = useI18n();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        role: "",
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || "",
                email: user.email || "",
                phone: user.phone || "",
                role: user.role || "",
            });
        }
    }, [user]);

    const validateForm = () => {
        if (formData.name.trim().length < 2) {
            toast.error(t('auth.nameRequired') || "Name must be at least 2 characters long");
            return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            toast.error(t('auth.invalidEmail') || "Please enter a valid email address");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        if (!validateForm()) return;

        setLoading(true);

        try {
            const updateData: UpdateUserDto = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone || undefined,
                role: formData.role,
            };

            await usersApi.update(user.id, updateData);
            toast.success(t('staff.updateSuccess').replace('{name}', user.name));
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to update staff");
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{t('staff.edit')}: {user.name}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('auth.name')}</label>
                        <Input
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder={t('auth.name')}
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('auth.email')}</label>
                        <Input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="staff@example.com"
                        />
                    </div>

                    {/* Role */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.role') || 'Role'}</label>
                        <select
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                        >
                            <option value="WAITER">{t('role.waiter')}</option>
                            <option value="KITCHEN">{t('role.kitchen')}</option>
                            <option value="ADMIN">{t('role.admin')}</option>
                        </select>
                        {formData.role === 'ADMIN' && (
                            <div className="mt-2 text-[10px] text-red-600 bg-red-50 p-2 rounded-lg border border-red-100 flex gap-2">
                                <Icons.AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                                <span>{t('staff.adminWarning') || 'Warning: Admin accounts have full system access.'}</span>
                            </div>
                        )}
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('auth.phone')}</label>
                        <Input
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="0912345678"
                        />
                    </div>

                    <div className="flex justify-end gap-2 mt-6">
                        <Button variant="outline" type="button" onClick={onClose} disabled={loading}>
                            {t('common.cancel') || 'Cancel'}
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? t('common.updating') || 'Updating...' : t('staff.edit')}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
