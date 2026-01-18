"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, UtensilsCrossed, QrCode, LogIn } from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function LandingPage() {
  const { t } = useI18n();

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Navigation */}
      <header className="px-4 lg:px-6 h-16 flex items-center bg-white shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-2 font-bold text-xl text-orange-600">
          <UtensilsCrossed className="h-6 w-6" />
          <span>{t('common.appName')}</span>
        </div>
        <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
          <LanguageSwitcher />
          <Link href="/login" className="text-sm font-bold text-slate-700 hover:text-orange-600 transition-colors flex items-center gap-1">
            <LogIn className="w-4 h-4" />
            {t('auth.login')}
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-white relative overflow-hidden">
          {/* Background Decoration */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-orange-50 to-slate-100 -z-10"></div>

          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-6 lg:grid-cols-2 items-center">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-slate-900">
                    {t('home.experienceSmart')} <span className="text-orange-600">{t('home.smart')}</span>
                  </h1>
                  <p className="max-w-[600px] text-slate-500 md:text-xl dark:text-slate-400">
                    {t('home.experienceDesc')}
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link
                    href="/tables"
                    className="inline-flex h-12 items-center justify-center rounded-md bg-orange-600 px-8 text-sm font-medium text-white shadow transition-colors hover:bg-orange-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-orange-700"
                  >
                    <QrCode className="mr-2 h-4 w-4" />
                    {t('home.scanQr')}
                  </Link>
                  <Link
                    href="/menu"
                    className="inline-flex h-12 items-center justify-center rounded-md border border-slate-200 bg-white px-8 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950"
                  >
                    {t('home.viewMenu')}
                  </Link>
                </div>
              </div>

              {/* Image Placeholder - In a real app, use the generated image here */}
              <div className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full lg:order-last shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop"
                  alt="Restaurant Hero"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-slate-50">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-orange-100 px-3 py-1 text-sm text-orange-600">
                  {t('home.featuresTitle')}
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-slate-900">
                  {t('home.featuresSubtitle')}
                </h2>
                <p className="max-w-[900px] text-slate-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  {t('home.featuresDesc')}
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              {/* Feature 1 */}
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="p-4 bg-white rounded-full shadow-lg text-orange-600">
                  <QrCode className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">{t('home.qrFeatureTitle')}</h3>
                <p className="text-slate-600">{t('home.qrFeatureDesc')}</p>
              </div>

              {/* Feature 2 */}
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="p-4 bg-white rounded-full shadow-lg text-orange-600">
                  <UtensilsCrossed className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">{t('home.kitchenFeatureTitle')}</h3>
                <p className="text-slate-600">{t('home.kitchenFeatureDesc')}</p>
              </div>

              {/* Feature 3 */}
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="p-4 bg-white rounded-full shadow-lg text-orange-600">
                  <LogIn className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">{t('home.tableFeatureTitle')}</h3>
                <p className="text-slate-600">{t('home.tableFeatureDesc')}</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t bg-white">
        <p className="text-xs text-slate-500">
          {t('home.footerRights')}
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4 text-slate-500" href="#">
            {t('home.terms')}
          </Link>
          <Link className="text-xs hover:underline underline-offset-4 text-slate-500" href="#">
            {t('home.privacy')}
          </Link>
        </nav>
      </footer>
    </div>
  );
}
