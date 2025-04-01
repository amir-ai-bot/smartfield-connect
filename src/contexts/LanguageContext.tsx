
import React, { createContext, useContext, useState, useEffect } from 'react';

type LanguageType = 'fr' | 'en' | 'ar';

interface Translations {
  [key: string]: {
    [key: string]: string
  }
}

// Define translations
const translations: Translations = {
  fr: {
    home: 'Accueil',
    projects: 'Projets',
    suppliers: 'Marchands',
    weather: 'Météo',
    profile: 'Profil',
    admin: 'Admin',
    logout: 'Déconnexion',
    submit: 'Soumettre',
    cancel: 'Annuler',
    email: 'Email',
    password: 'Mot de passe',
    login: 'Connexion',
    signup: 'S\'inscrire',
    resetPassword: 'Réinitialiser le mot de passe',
    verifyEmail: 'Vérifier l\'email',
    name: 'Nom',
    phone: 'Téléphone',
    address: 'Adresse',
    bio: 'Bio',
    save: 'Enregistrer',
    createProject: 'Créer un projet',
    title: 'Titre',
    description: 'Description',
    crop: 'Culture',
    location: 'Localisation',
    startDate: 'Date de début',
    endDate: 'Date de fin',
    progress: 'Progrès',
    status: 'Statut',
    public: 'Public',
    private: 'Privé',
    create: 'Créer',
    edit: 'Modifier',
    delete: 'Supprimer',
    confirm: 'Confirmer',
    welcomeMessage: 'Bienvenue sur AgriSmart',
    temperatureFeelsLike: 'Ressenti',
    wind: 'Vent',
    humidity: 'Humidité',
    weekForecast: 'Prévisions pour la semaine',
    upcomingTasks: 'Tâches à venir'
  },
  en: {
    home: 'Home',
    projects: 'Projects',
    suppliers: 'Suppliers',
    weather: 'Weather',
    profile: 'Profile',
    admin: 'Admin',
    logout: 'Logout',
    submit: 'Submit',
    cancel: 'Cancel',
    email: 'Email',
    password: 'Password',
    login: 'Login',
    signup: 'Sign up',
    resetPassword: 'Reset Password',
    verifyEmail: 'Verify Email',
    name: 'Name',
    phone: 'Phone',
    address: 'Address',
    bio: 'Bio',
    save: 'Save',
    createProject: 'Create Project',
    title: 'Title',
    description: 'Description',
    crop: 'Crop',
    location: 'Location',
    startDate: 'Start Date',
    endDate: 'End Date',
    progress: 'Progress',
    status: 'Status',
    public: 'Public',
    private: 'Private',
    create: 'Create',
    edit: 'Edit',
    delete: 'Delete',
    confirm: 'Confirm',
    welcomeMessage: 'Welcome to AgriSmart',
    temperatureFeelsLike: 'Feels like',
    wind: 'Wind',
    humidity: 'Humidity',
    weekForecast: 'Week forecast',
    upcomingTasks: 'Upcoming tasks'
  },
  ar: {
    home: 'الرئيسية',
    projects: 'المشاريع',
    suppliers: 'الموردين',
    weather: 'الطقس',
    profile: 'الملف الشخصي',
    admin: 'المشرف',
    logout: 'تسجيل الخروج',
    submit: 'إرسال',
    cancel: 'إلغاء',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    login: 'تسجيل الدخول',
    signup: 'التسجيل',
    resetPassword: 'إعادة تعيين كلمة المرور',
    verifyEmail: 'تأكيد البريد الإلكتروني',
    name: 'الاسم',
    phone: 'الهاتف',
    address: 'العنوان',
    bio: 'نبذة',
    save: 'حفظ',
    createProject: 'إنشاء مشروع',
    title: 'العنوان',
    description: 'الوصف',
    crop: 'المحصول',
    location: 'الموقع',
    startDate: 'تاريخ البدء',
    endDate: 'تاريخ الانتهاء',
    progress: 'التقدم',
    status: 'الحالة',
    public: 'عام',
    private: 'خاص',
    create: 'إنشاء',
    edit: 'تعديل',
    delete: 'حذف',
    confirm: 'تأكيد',
    welcomeMessage: 'مرحبا بكم في أغريسمارت',
    temperatureFeelsLike: 'يشعر وكأنه',
    wind: 'الرياح',
    humidity: 'الرطوبة',
    weekForecast: 'توقعات الأسبوع',
    upcomingTasks: 'المهام القادمة'
  }
};

interface LanguageContextType {
  language: LanguageType;
  setLanguage: (lang: LanguageType) => void;
  getTranslation: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<LanguageType>('fr');

  // Load language preference from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('agrismart_language') as LanguageType;
    if (savedLanguage && ['fr', 'en', 'ar'].includes(savedLanguage)) {
      setLanguage(savedLanguage);
    }
  }, []);

  // Save language preference to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('agrismart_language', language);
    
    // Set document direction for Arabic language
    if (language === 'ar') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = language;
    }
  }, [language]);

  const getTranslation = (key: string): string => {
    if (translations[language] && translations[language][key]) {
      return translations[language][key];
    }
    // Fallback to French if translation is missing
    if (translations['fr'] && translations['fr'][key]) {
      return translations['fr'][key];
    }
    return key; // Return key as fallback
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, getTranslation }}>
      {children}
    </LanguageContext.Provider>
  );
};
