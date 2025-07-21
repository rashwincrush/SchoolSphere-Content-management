import { AppShell } from '@/components/layout/AppShell';
import { useLanguage } from '@/context/LanguageContext';

export default function Users() {
  const { t } = useLanguage();

  return (
    <AppShell>
      <div className="mb-8">
        <h1 className="text-3xl font-roboto-slab font-bold text-gray-900 mb-2">
          {t('users')}
        </h1>
        <p className="text-gray-600">
          Manage users and permissions
        </p>
      </div>
      
      <div className="text-center py-12">
        <p className="text-gray-500">User management coming soon...</p>
      </div>
    </AppShell>
  );
}
