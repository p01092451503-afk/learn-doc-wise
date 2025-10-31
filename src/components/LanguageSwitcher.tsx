import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";

export const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setLanguage(language === 'ko' ? 'en' : 'ko')}
      className="gap-2"
    >
      <Languages className="h-4 w-4" />
      {language === 'ko' ? 'EN' : 'KO'}
    </Button>
  );
};
