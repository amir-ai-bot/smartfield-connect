
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { UserPreferences } from '@/types/auth';

interface LanguageContextType {
  language: 'fr' | 'en' | 'ar';
  setLanguage: (language: 'fr' | 'en' | 'ar') => void;
  t: (key: string) => string;
}

interface Translations {
  [key: string]: {
    fr: string;
    en: string;
    ar: string;
  };
}

const translations: Translations = {
  welcome: {
    fr: 'Bienvenue sur AgriSmart',
    en: 'Welcome to AgriSmart',
    ar: 'مرحبًا بكم في AgriSmart'
  },
  login: {
    fr: 'Se connecter',
    en: 'Login',
    ar: 'تسجيل الدخول'
  },
  signup: {
    fr: 'S\'inscrire',
    en: 'Sign Up',
    ar: 'التسجيل'
  },
  home: {
    fr: 'Accueil',
    en: 'Home',
    ar: 'الصفحة الرئيسية'
  },
  dashboard: {
    fr: 'Tableau de bord',
    en: 'Dashboard',
    ar: 'لوحة القيادة'
  },
  projects: {
    fr: 'Projets',
    en: 'Projects',
    ar: 'المشاريع'
  },
  suppliers: {
    fr: 'Fournisseurs',
    en: 'Suppliers',
    ar: 'الموردين'
  },
  weather: {
    fr: 'Météo',
    en: 'Weather',
    ar: 'الطقس'
  },
  profile: {
    fr: 'Profil',
    en: 'Profile',
    ar: 'الملف الشخصي'
  },
  logout: {
    fr: 'Se déconnecter',
    en: 'Logout',
    ar: 'تسجيل الخروج'
  },
  email: {
    fr: 'Adresse email',
    en: 'Email address',
    ar: 'عنوان البريد الإلكتروني'
  },
  password: {
    fr: 'Mot de passe',
    en: 'Password',
    ar: 'كلمة المرور'
  },
  name: {
    fr: 'Nom',
    en: 'Name',
    ar: 'الاسم'
  },
  phone: {
    fr: 'Téléphone',
    en: 'Phone',
    ar: 'الهاتف'
  },
  address: {
    fr: 'Adresse',
    en: 'Address',
    ar: 'العنوان'
  },
  bio: {
    fr: 'Biographie',
    en: 'Bio',
    ar: 'السيرة الذاتية'
  },
  save: {
    fr: 'Enregistrer',
    en: 'Save',
    ar: 'حفظ'
  },
  cancel: {
    fr: 'Annuler',
    en: 'Cancel',
    ar: 'إلغاء'
  },
  error: {
    fr: 'Erreur',
    en: 'Error',
    ar: 'خطأ'
  },
  success: {
    fr: 'Succès',
    en: 'Success',
    ar: 'نجاح'
  },
  admin: {
    fr: 'Administration',
    en: 'Administration',
    ar: 'الإدارة'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<'fr' | 'en' | 'ar'>('fr');
  const { user } = useAuth();

  useEffect(() => {
    // Load language from localStorage
    const storedLanguage = localStorage.getItem('language');
    if (storedLanguage && ['fr', 'en', 'ar'].includes(storedLanguage)) {
      setLanguageState(storedLanguage as 'fr' | 'en' | 'ar');
    }
    
    // If user is logged in, load language from user preferences
    if (user && user.preferences && user.preferences.language) {
      setLanguageState(user.preferences.language);
    }
  }, [user]);

  const setLanguage = async (newLanguage: 'fr' | 'en' | 'ar') => {
    setLanguageState(newLanguage);
    localStorage.setItem('language', newLanguage);
    
    // If user is logged in, update user preferences
    if (user) {
      try {
        // Get current preferences
        const { data: profileData } = await supabase
          .from('profiles')
          .select('preferences')
          .eq('id', user.id)
          .single();
        
        // Update preferences with new language
        const currentPreferences = profileData?.preferences || {};
        const updatedPreferences = {
          ...currentPreferences,
          language: newLanguage
        };
        
        // Save to database
        await supabase
          .from('profiles')
          .update({ 
            preferences: updatedPreferences,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);
      } catch (error) {
        console.error('Error updating language preference:', error);
      }
    }
  };

  const t = (key: string): string => {
    if (!translations[key]) {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
    return translations[key][language];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
