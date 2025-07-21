import { AppShell } from '@/components/layout/AppShell';
import { useLanguage } from '@/context/LanguageContext';

export default function Calendar() {
  const { t } = useLanguage();

  return (
    <AppShell>
      <div className="mb-8">
        <h1 className="text-3xl font-roboto-slab font-bold text-gray-900 mb-2">
          {t('calendar')}
        </h1>
        <p className="text-gray-600">
          View events across all branches in calendar format
        </p>
      </div>
      
      <div className="text-center py-12">
        <p className="text-gray-500">Calendar view coming soon...</p>
      </div>
    </AppShell>
  );
}
