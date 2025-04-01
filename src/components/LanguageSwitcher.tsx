
import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();

  const handleLanguageChange = (lang: 'en' | 'fr' | 'ar') => {
    setLanguage(lang);
    const messages = {
      'en': 'Language changed to English',
      'fr': 'Langue changée en Français',
      'ar': 'تم تغيير اللغة إلى العربية'
    };
    toast.success(messages[lang]);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full flex items-center">
          <Globe className="h-5 w-5" />
          <span className="ml-2 hidden md:inline">{language.toUpperCase()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleLanguageChange('fr')}>
          🇫🇷 Français
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleLanguageChange('en')}>
          🇬🇧 English
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleLanguageChange('ar')}>
          🇹🇳 العربية
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
