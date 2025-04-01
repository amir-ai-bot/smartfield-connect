
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Define the translations
const translations = {
  en: {
    welcome: "Welcome to AgriTech",
    projects: "Projects",
    dashboard: "Dashboard",
    profile: "Profile",
    weather: "Weather",
    suppliers: "Suppliers",
    conversations: "Conversations",
    createProject: "Create Project",
    login: "Log in",
    signup: "Sign up",
    logout: "Log out",
    searchProjects: "Search projects...",
    status: "Status",
    crop: "Crop",
    all: "All",
    active: "Active",
    planning: "Planning",
    completed: "Completed",
    noProjectsFound: "No projects found",
    resetFilters: "Reset filters",
    addProject: "New project",
    projectDetails: "Project details",
    startDate: "Start date",
    endDate: "End date",
    location: "Location",
    description: "Description",
    progress: "Progress",
    delete: "Delete",
    edit: "Edit",
    save: "Save",
    cancel: "Cancel"
  },
  fr: {
    welcome: "Bienvenue à AgriTech",
    projects: "Projets",
    dashboard: "Tableau de bord",
    profile: "Profil",
    weather: "Météo",
    suppliers: "Fournisseurs",
    conversations: "Conversations",
    createProject: "Créer un projet",
    login: "Connexion",
    signup: "Inscription",
    logout: "Déconnexion",
    searchProjects: "Rechercher des projets...",
    status: "Statut",
    crop: "Culture",
    all: "Tous",
    active: "Actifs",
    planning: "Planification",
    completed: "Complétés",
    noProjectsFound: "Aucun projet trouvé",
    resetFilters: "Réinitialiser les filtres",
    addProject: "Nouveau projet",
    projectDetails: "Détails du projet",
    startDate: "Date de début",
    endDate: "Date de fin",
    location: "Emplacement",
    description: "Description",
    progress: "Progression",
    delete: "Supprimer",
    edit: "Modifier",
    save: "Enregistrer",
    cancel: "Annuler"
  },
  ar: {
    welcome: "مرحبًا بك في أجريتيك",
    projects: "المشاريع",
    dashboard: "لوحة التحكم",
    profile: "الملف الشخصي",
    weather: "الطقس",
    suppliers: "الموردون",
    conversations: "المحادثات",
    createProject: "إنشاء مشروع",
    login: "تسجيل الدخول",
    signup: "إنشاء حساب",
    logout: "تسجيل الخروج",
    searchProjects: "البحث عن المشاريع...",
    status: "الحالة",
    crop: "المحصول",
    all: "الكل",
    active: "نشط",
    planning: "تخطيط",
    completed: "مكتمل",
    noProjectsFound: "لم يتم العثور على مشاريع",
    resetFilters: "إعادة تعيين التصفية",
    addProject: "مشروع جديد",
    projectDetails: "تفاصيل المشروع",
    startDate: "تاريخ البدء",
    endDate: "تاريخ الانتهاء",
    location: "الموقع",
    description: "الوصف",
    progress: "التقدم",
    delete: "حذف",
    edit: "تعديل",
    save: "حفظ",
    cancel: "إلغاء"
  }
};

type LanguageType = 'en' | 'fr' | 'ar';
type LanguageContextType = {
  language: LanguageType;
  setLanguage: (lang: LanguageType) => void;
  t: (key: string) => string;
  dir: 'ltr' | 'rtl';
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

type LanguageProviderProps = {
  children: ReactNode;
};

interface UserPreferences {
  language?: LanguageType;
  [key: string]: any;
}

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const [language, setLanguage] = useState<LanguageType>('fr');
  
  useEffect(() => {
    // Try to get saved language preference from localStorage
    const savedLanguage = localStorage.getItem('preferredLanguage') as LanguageType | null;
    if (savedLanguage && ['en', 'fr', 'ar'].includes(savedLanguage)) {
      setLanguage(savedLanguage);
    }

    // Also try to get user's preference from DB if user is logged in
    const getCurrentUserPreference = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('preferences')
          .eq('id', user.id)
          .single();
        
        if (data?.preferences) {
          const prefs = data.preferences as UserPreferences;
          if (prefs.language && ['en', 'fr', 'ar'].includes(prefs.language)) {
            setLanguage(prefs.language);
            localStorage.setItem('preferredLanguage', prefs.language);
          }
        }
      }
    };

    getCurrentUserPreference();
  }, []);

  // Update language and save preference
  const changeLanguage = async (lang: LanguageType) => {
    setLanguage(lang);
    localStorage.setItem('preferredLanguage', lang);
    
    // Update user preference in DB if logged in
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select('preferences')
        .eq('id', user.id)
        .single();
      
      let updatedPreferences: UserPreferences = { language: lang };
      if (data?.preferences) {
        const existingPrefs = data.preferences as UserPreferences;
        updatedPreferences = { 
          ...existingPrefs,
          language: lang 
        };
      }
      
      await supabase
        .from('profiles')
        .update({ preferences: updatedPreferences })
        .eq('id', user.id);
    }
  };

  // Get text for a given key in current language
  const t = (key: string): string => {
    const langObj = translations[language] as Record<string, string>;
    return langObj[key] || key;
  };

  // Set text direction based on language
  const dir = language === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    // Apply direction to html element
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
    
    // Add appropriate class for RTL styling if needed
    if (dir === 'rtl') {
      document.documentElement.classList.add('rtl');
    } else {
      document.documentElement.classList.remove('rtl');
    }
  }, [dir, language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
