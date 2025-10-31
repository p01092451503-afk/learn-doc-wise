import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";

export const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setLanguage(language === 'ko' ? 'en' : 'ko')}
      className="h-8 px-2 text-xs font-medium"
    >
      {language === 'ko' ? 'EN' : 'KO'}
    </Button>
  );
};
