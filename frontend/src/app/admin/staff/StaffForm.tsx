"use client";

import { useState } from "react";
import { usersApi } from "@/lib/api/users";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import toast from "react-hot-toast";
import { useI18n } from "@/contexts/I18nContext";
import * as Icons from "lucide-react";

interface StaffFormProps {
    onClose: () => void;
}

export default function StaffForm({ onClose }: StaffFormProps) {
    const { t } = useI18n();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "WAITER", // Default
        phone: "",
    });

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
        if (formData.password.length < 8) {
            toast.error(t('auth.passwordMinLength') || "Password must be at least 8 characters long");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);

        try {
            await usersApi.create(formData);
            toast.success(t('staff.createSuccess').replace('{name}', formData.name));
            onClose();
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || t('common.error') || "Failed to create staff");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{t('staff.addNew')}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4" noValidate>

                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.name')}</label>
                        <Input
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder={t('auth.name')}
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.email')}</label>
                        <Input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="staff@example.com"
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.password')}</label>
                        <div className="relative">
                            <Input
                                type={showPassword ? "text" : "password"}
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                placeholder="••••••••"
                                className="pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                            >
                                {showPassword ? (
                                    <Icons.EyeOff className="h-4 w-4" />
                                ) : (
                                    <Icons.Eye className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Role Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('auth.role') || 'Role'}</label>
                        <div className="grid grid-cols-3 gap-2">
                            <button
                                type="button"
                                className={`py-2 px-2 rounded-lg border text-xs flex flex-col items-center gap-1 transition-all ${formData.role === 'WAITER' ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-bold shadow-sm' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                onClick={() => setFormData({ ...formData, role: 'WAITER' })}
                            >
                                <Icons.User className="h-4 w-4" />
                                {t('role.waiter')}
                            </button>
                            <button
                                type="button"
                                className={`py-2 px-2 rounded-lg border text-xs flex flex-col items-center gap-1 transition-all ${formData.role === 'KITCHEN' ? 'bg-orange-50 border-orange-500 text-orange-700 font-bold shadow-sm' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                onClick={() => setFormData({ ...formData, role: 'KITCHEN' })}
                            >
                                <Icons.UtensilsCrossed className="h-4 w-4" />
                                {t('role.kitchen')}
                            </button>
                            <button
                                type="button"
                                className={`py-2 px-2 rounded-lg border text-xs flex flex-col items-center gap-1 transition-all ${formData.role === 'ADMIN' ? 'bg-red-50 border-red-500 text-red-700 font-bold shadow-sm' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                onClick={() => setFormData({ ...formData, role: 'ADMIN' })}
                            >
                                <Icons.ShieldCheck className="h-4 w-4" />
                                {t('role.admin')}
                            </button>
                        </div>
                        {formData.role === 'ADMIN' && (
                            <div className="mt-2 text-[10px] text-red-600 bg-red-50 p-2 rounded-lg border border-red-100 flex gap-2">
                                <Icons.AlertTriangle className="h-3 w-3 shrink-0" />
                                <span>{t('staff.adminWarning') || 'Warning: Admin accounts have full access.'}</span>
                            </div>
                        )}
                    </div>

                    {/* Phone (Optional) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('auth.phone')}</label>
                        <Input
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="0912345678"
                        />
                    </div>

                    <div className="flex justify-end gap-2 mt-8">
                        <Button variant="outline" type="button" onClick={onClose} disabled={loading} className="px-6">
                            {t('common.cancel')}
                        </Button>
                        <Button type="submit" disabled={loading} className="px-6">
                            {loading ? t('common.loading') : t('staff.create') || 'Create'}
                        </Button>
                    </div>

                </form>
            </DialogContent>
        </Dialog>
    );
}
