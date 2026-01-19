import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

// Can be imported from a shared config
const locales = ['en', 'vi'];

export default getRequestConfig(async ({ requestLocale }) => {
    // This typically returns a Promise in newer Next.js versions
    let locale = await requestLocale;

    // Validate that the incoming `locale` parameter is valid
    if (!locale || !locales.includes(locale as any)) {
        // Fallback or 404
        // ensure locale is valid string for import
        locale = 'vi';
    }

    return {
        locale,
        messages: (await import(`./messages/${locale}.json`)).default
    };
});
