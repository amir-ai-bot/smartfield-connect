
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type SupportedLanguage = 'fr' | 'en' | 'ar';

export interface LanguageContextType {
  t: (key: string, params?: Record<string, string>) => string;
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  translations: Record<string, Record<string, string>>;
}

// Default translations
const translations: Record<SupportedLanguage, Record<string, string>> = {
  en: {
    hello: 'Hello',
    welcome: 'Welcome to AgriSmart',
    login: 'Login',
    signup: 'Sign up',
    email: 'Email',
    password: 'Password',
    submit: 'Submit',
    cancel: 'Cancel',
    name: 'Name',
    confirmPassword: 'Confirm Password',
    forgotPassword: 'Forgot Password?',
    resetPassword: 'Reset Password',
    newPassword: 'New Password',
    confirmNewPassword: 'Confirm New Password',
    verifyEmail: 'Verify Email',
    code: 'Verification Code',
    progress: 'Progress',
    location: 'Location',
    phone: 'Phone',
    products: 'Products',
    rating: 'Rating',
    viewDetails: 'View Details',
    profile: 'Profile',
    settings: 'Settings',
    logout: 'Logout',
    dashboard: 'Dashboard',
    projects: 'Projects',
    suppliers: 'Suppliers',
    weather: 'Weather',
    conversations: 'Messages',
    favorites: 'Favorites',
    admin: 'Admin',
    search: 'Search',
    searchSuppliers: 'Search suppliers...',
    loading: 'Loading...',
    error: 'An error occurred',
    success: 'Success!',
    save: 'Save',
    edit: 'Edit',
    delete: 'Delete',
    create: 'Create',
    update: 'Update',
    back: 'Back',
    next: 'Next'
  },
  fr: {
    hello: 'Bonjour',
    welcome: 'Bienvenue à AgriSmart',
    login: 'Connexion',
    signup: 'Inscription',
    email: 'Email',
    password: 'Mot de passe',
    submit: 'Soumettre',
    cancel: 'Annuler',
    name: 'Nom',
    confirmPassword: 'Confirmer le mot de passe',
    forgotPassword: 'Mot de passe oublié?',
    resetPassword: 'Réinitialiser le mot de passe',
    newPassword: 'Nouveau mot de passe',
    confirmNewPassword: 'Confirmer le nouveau mot de passe',
    verifyEmail: 'Vérifier l\'email',
    code: 'Code de vérification',
    progress: 'Progression',
    location: 'Emplacement',
    phone: 'Téléphone',
    products: 'Produits',
    rating: 'Évaluation',
    viewDetails: 'Voir les détails',
    profile: 'Profil',
    settings: 'Paramètres',
    logout: 'Déconnexion',
    dashboard: 'Tableau de bord',
    projects: 'Projets',
    suppliers: 'Fournisseurs',
    weather: 'Météo',
    conversations: 'Messages',
    favorites: 'Favoris',
    admin: 'Admin',
    search: 'Rechercher',
    searchSuppliers: 'Rechercher des fournisseurs...',
    loading: 'Chargement...',
    error: 'Une erreur est survenue',
    success: 'Succès!',
    save: 'Enregistrer',
    edit: 'Modifier',
    delete: 'Supprimer',
    create: 'Créer',
    update: 'Mettre à jour',
    back: 'Retour',
    next: 'Suivant'
  },
  ar: {
    hello: 'مرحبا',
    welcome: 'أهلا بك في أجريسمارت',
    login: 'تسجيل الدخول',
    signup: 'إنشاء حساب',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    submit: 'إرسال',
    cancel: 'إلغاء',
    name: 'الاسم',
    confirmPassword: 'تأكيد كلمة المرور',
    forgotPassword: 'نسيت كلمة المرور؟',
    resetPassword: 'إعادة تعيين كلمة المرور',
    newPassword: 'كلمة مرور جديدة',
    confirmNewPassword: 'تأكيد كلمة المرور الجديدة',
    verifyEmail: 'التحقق من البريد الإلكتروني',
    code: 'رمز التحقق',
    progress: 'التقدم',
    location: 'الموقع',
    phone: 'الهاتف',
    products: 'المنتجات',
    rating: 'التقييم',
    viewDetails: 'عرض التفاصيل',
    profile: 'الملف الشخصي',
    settings: 'الإعدادات',
    logout: 'تسجيل الخروج',
    dashboard: 'لوحة التحكم',
    projects: 'المشاريع',
    suppliers: 'الموردين',
    weather: 'الطقس',
    conversations: 'الرسائل',
    favorites: 'المفضلة',
    admin: 'المشرف',
    search: 'بحث',
    searchSuppliers: 'البحث عن موردين...',
    loading: 'جاري التحميل...',
    error: 'حدث خطأ',
    success: 'نجاح!',
    save: 'حفظ',
    edit: 'تعديل',
    delete: 'حذف',
    create: 'إنشاء',
    update: 'تحديث',
    back: 'رجوع',
    next: 'التالي'
  }
};

// Create context with default values
const LanguageContext = createContext<LanguageContextType>({
  t: (key: string) => key,
  language: 'fr',
  setLanguage: () => {},
  translations: translations
});

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<SupportedLanguage>('fr');

  useEffect(() => {
    // Try to load language from localStorage
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && (savedLanguage === 'fr' || savedLanguage === 'en' || savedLanguage === 'ar')) {
      setLanguage(savedLanguage);
    }
  }, []);

  useEffect(() => {
    // Save language to localStorage when it changes
    localStorage.setItem('language', language);
    
    // Set the direction of the document based on language
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    
    // Add the language as a class to the body
    document.body.className = document.body.className
      .replace(/lang-\w+/g, '')
      .concat(` lang-${language}`);
  }, [language]);

  const t = (key: string, params?: Record<string, string>): string => {
    let text = translations[language][key] || key;
    
    // Replace parameters if provided
    if (params) {
      Object.entries(params).forEach(([paramKey, value]) => {
        text = text.replace(`{${paramKey}}`, value);
      });
    }
    
    return text;
  };

  // Create a value object that doesn't spread 'translations'
  const contextValue: LanguageContextType = {
    language,
    setLanguage,
    t,
    translations
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

export default LanguageContext;
