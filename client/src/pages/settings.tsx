import { AppShell } from '@/components/layout/AppShell';
import { useLanguage } from '@/context/LanguageContext';

export default function Settings() {
  const { t } = useLanguage();

  return (
    <AppShell>
      <div className="mb-8">
        <h1 className="text-3xl font-roboto-slab font-bold text-gray-900 mb-2">
          {t('settings')}
        </h1>
        <p className="text-gray-600">
          Configure system settings and preferences
        </p>
      </div>
      
      <div className="text-center py-12">
        <p className="text-gray-500">Settings page coming soon...</p>
      </div>
    </AppShell>
  );
}
