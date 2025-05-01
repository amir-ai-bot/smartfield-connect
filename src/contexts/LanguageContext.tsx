
import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

type Language = 'fr' | 'en' | 'ar';

interface LanguageValue {
  fr: string;
  en: string;
  ar: string;
}

interface TranslationCategory {
  [key: string]: LanguageValue;
}

interface Translations {
  [key: string]: TranslationCategory;
}

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  translations: Translations;
}

const translations: Translations = {
  common: {
    welcome: {
      fr: 'Bienvenue',
      en: 'Welcome',
      ar: 'مرحبا',
    },
    login: {
      fr: 'Connexion',
      en: 'Login',
      ar: 'تسجيل الدخول',
    },
    logout: {
      fr: 'Déconnexion',
      en: 'Logout',
      ar: 'تسجيل الخروج',
    },
    signup: {
      fr: 'Inscription',
      en: 'Sign Up',
      ar: 'التسجيل',
    },
    email: {
      fr: 'Email',
      en: 'Email',
      ar: 'البريد الإلكتروني',
    },
    password: {
      fr: 'Mot de passe',
      en: 'Password',
      ar: 'كلمة المرور',
    },
    name: {
      fr: 'Nom',
      en: 'Name',
      ar: 'الاسم',
    },
    dashboard: {
      fr: 'Tableau de bord',
      en: 'Dashboard',
      ar: 'لوحة التحكم',
    },
    profile: {
      fr: 'Profil',
      en: 'Profile',
      ar: 'الملف الشخصي',
    },
    projects: {
      fr: 'Projets',
      en: 'Projects',
      ar: 'المشاريع',
    },
    suppliers: {
      fr: 'Fournisseurs',
      en: 'Suppliers',
      ar: 'الموردين',
    },
    messages: {
      fr: 'Messages',
      en: 'Messages',
      ar: 'الرسائل',
    },
    settings: {
      fr: 'Paramètres',
      en: 'Settings',
      ar: 'الإعدادات',
    },
    search: {
      fr: 'Rechercher',
      en: 'Search',
      ar: 'بحث',
    },
    save: {
      fr: 'Enregistrer',
      en: 'Save',
      ar: 'حفظ',
    },
    cancel: {
      fr: 'Annuler',
      en: 'Cancel',
      ar: 'إلغاء',
    },
    delete: {
      fr: 'Supprimer',
      en: 'Delete',
      ar: 'حذف',
    },
    edit: {
      fr: 'Modifier',
      en: 'Edit',
      ar: 'تعديل',
    },
    create: {
      fr: 'Créer',
      en: 'Create',
      ar: 'إنشاء',
    },
    newProject: {
      fr: 'Nouveau projet',
      en: 'New Project',
      ar: 'مشروع جديد',
    },
    projectDetails: {
      fr: 'Détails du projet',
      en: 'Project Details',
      ar: 'تفاصيل المشروع',
    },
    projectName: {
      fr: 'Nom du projet',
      en: 'Project Name',
      ar: 'اسم المشروع',
    },
    projectDescription: {
      fr: 'Description du projet',
      en: 'Project Description',
      ar: 'وصف المشروع',
    },
    status: {
      fr: 'Statut',
      en: 'Status',
      ar: 'الحالة',
    },
    active: {
      fr: 'Actif',
      en: 'Active',
      ar: 'نشط',
    },
    completed: {
      fr: 'Terminé',
      en: 'Completed',
      ar: 'مكتمل',
    },
    planning: {
      fr: 'En planification',
      en: 'Planning',
      ar: 'في مرحلة التخطيط',
    },
    home: {
      fr: 'Accueil',
      en: 'Home',
      ar: 'الرئيسية',
    },
    weather: {
      fr: 'Météo',
      en: 'Weather',
      ar: 'الطقس',
    },
    admin: {
      fr: 'Administration',
      en: 'Admin',
      ar: 'الإدارة',
    },
  },
};

const flattenTranslations = (translations: Translations, language: Language): { [key: string]: string } => {
  const result: { [key: string]: string } = {};
  
  Object.entries(translations).forEach(([category, keys]) => {
    Object.entries(keys).forEach(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        result[`${category}.${key}`] = value[language] || value.en || key;
      } else {
        result[`${category}.${key}`] = key;
      }
    });
  });
  
  return result;
};

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [language, setLanguageState] = useState<Language>('fr');
  const [flattenedTranslations, setFlattenedTranslations] = useState<{ [key: string]: string }>(
    flattenTranslations(translations, 'fr')
  );

  // Load user's language preference
  useEffect(() => {
    const loadLanguagePreference = async () => {
      if (user) {
        try {
          // Get the user's profile from the database
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          
          if (error) {
            throw error;
          }
          
          // Check if the user has a language preference
          if (data?.preferences && typeof data.preferences === 'object') {
            const userPreferences = data.preferences as { language?: string };
            const userLanguage = userPreferences.language;
            if (userLanguage && ['fr', 'en', 'ar'].includes(userLanguage)) {
              setLanguageState(userLanguage as Language);
              setFlattenedTranslations(flattenTranslations(translations, userLanguage as Language));
            }
          }
        } catch (error) {
          console.error('Error loading language preference:', error);
        }
      }
    };
    
    loadLanguagePreference();
  }, [user]);

  // Set language and save preference
  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    setFlattenedTranslations(flattenTranslations(translations, lang));
    
    if (user) {
      try {
        // Get the current preferences
        const { data, error } = await supabase
          .from('profiles')
          .select('preferences')
          .eq('id', user.id)
          .single();
        
        if (error) {
          throw error;
        }
        
        // Update preferences with new language
        const currentPreferences = data?.preferences || {};
        let updatedPreferences;
        
        if (typeof currentPreferences === 'object') {
          updatedPreferences = {
            ...currentPreferences,
            language: lang
          };
        } else {
          updatedPreferences = { language: lang };
        }
        
        // Update the user's profile with the new preferences
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            preferences: updatedPreferences
          })
          .eq('id', user.id);
        
        if (updateError) {
          throw updateError;
        }
      } catch (error) {
        console.error('Error setting language preference:', error);
        toast.error('Erreur lors de la mise à jour de la langue');
      }
    }
  };

  const t = (key: string): string => {
    const parts = key.split('.');
    if (parts.length === 1) {
      return flattenedTranslations[key] || key;
    }
    
    const fullKey = key;
    return flattenedTranslations[fullKey] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, translations }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
