"use client";

import { Globe } from 'lucide-react';
import { useI18n } from '@/contexts/I18nContext';

export default function LanguageSwitcher() {
    const { locale, setLocale } = useI18n();

    const toggleLocale = () => {
        setLocale(locale === 'en' ? 'vi' : 'en');
    };

    return (
        <button
            onClick={toggleLocale}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
            title="Switch Language"
        >
            <Globe className="w-4 h-4" />
            <span className="text-xs font-bold w-4">{locale.toUpperCase()}</span>
        </button>
    );
}
