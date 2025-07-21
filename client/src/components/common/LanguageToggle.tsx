import { Globe } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'es' : 'en');
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className="text-white hover:bg-primary-800 transition-colors"
    >
      <Globe className="w-4 h-4 mr-1" />
      <span className="text-sm">{language.toUpperCase()}</span>
    </Button>
  );
}
