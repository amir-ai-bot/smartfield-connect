
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';

// Define available languages
type LanguageCode = 'fr' | 'en' | 'ar';

interface Translations {
  [key: string]: string;
}

// Interface for the context value
interface LanguageContextType {
  currentLanguage: LanguageCode;
  changeLanguage: (lang: LanguageCode) => void;
  t: (key: string) => string;
  dir: 'ltr' | 'rtl';
  languageName: string;
}

// Default translations
const translations: Record<LanguageCode, Translations> = {
  fr: {
    welcome: 'Bienvenue sur AgriSmart',
    dashboard: 'Tableau de bord',
    profile: 'Profil',
    settings: 'Paramètres',
    logout: 'Déconnexion',
    login: 'Connexion',
    signup: 'Inscription',
    email: 'Email',
    password: 'Mot de passe',
    name: 'Nom',
    phoneNumber: 'Numéro de téléphone',
    address: 'Adresse',
    bio: 'Biographie',
    save: 'Enregistrer',
    cancel: 'Annuler',
    delete: 'Supprimer',
    edit: 'Modifier',
    create: 'Créer',
    update: 'Mettre à jour',
    confirmPassword: 'Confirmer le mot de passe',
    forgotPassword: 'Mot de passe oublié?',
    resetPassword: 'Réinitialiser le mot de passe',
    verifyEmail: 'Vérifier l\'email',
    sending: 'Envoi en cours...',
    enterCodeSent: 'Entrez le code envoyé à votre email',
    codeRequired: 'Le code est requis',
    verifyCode: 'Vérifier le code',
    verifying: 'Vérification en cours...',
    backToLogin: 'Retour à la connexion',
    sendResetCode: 'Envoyer le code de réinitialisation',
    resetCodeSent: 'Instructions de réinitialisation envoyées à votre email',
    resetCodeError: 'Erreur lors de la demande de réinitialisation',
    emailRequired: 'L\'email est requis',
    invalidEmailFormat: 'Format d\'email invalide',
    passwordRequired: 'Le mot de passe est requis',
    nameRequired: 'Le nom est requis',
    passwordMinLength: '6 caractères minimum',
    passwordsDontMatch: 'Les mots de passe ne correspondent pas',
    enterNewPassword: 'Entrer le nouveau mot de passe',
    createNewPassword: 'Créer un nouveau mot de passe',
    alreadySignedUp: 'Déjà inscrit?',
    notSignedUp: 'Pas encore inscrit?',
    enterEmailForResetCode: 'Entrez votre email pour recevoir un code de réinitialisation'
  },
  en: {
    welcome: 'Welcome to AgriSmart',
    dashboard: 'Dashboard',
    profile: 'Profile',
    settings: 'Settings',
    logout: 'Logout',
    login: 'Login',
    signup: 'Sign Up',
    email: 'Email',
    password: 'Password',
    name: 'Name',
    phoneNumber: 'Phone Number',
    address: 'Address',
    bio: 'Bio',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    create: 'Create',
    update: 'Update',
    confirmPassword: 'Confirm Password',
    forgotPassword: 'Forgot Password?',
    resetPassword: 'Reset Password',
    verifyEmail: 'Verify Email',
    sending: 'Sending...',
    enterCodeSent: 'Enter the code sent to your email',
    codeRequired: 'Code is required',
    verifyCode: 'Verify Code',
    verifying: 'Verifying...',
    backToLogin: 'Back to Login',
    sendResetCode: 'Send Reset Code',
    resetCodeSent: 'Reset instructions sent to your email',
    resetCodeError: 'Error requesting password reset',
    emailRequired: 'Email is required',
    invalidEmailFormat: 'Invalid email format',
    passwordRequired: 'Password is required',
    nameRequired: 'Name is required',
    passwordMinLength: 'Minimum 6 characters',
    passwordsDontMatch: 'Passwords do not match',
    enterNewPassword: 'Enter new password',
    createNewPassword: 'Create new password',
    alreadySignedUp: 'Already signed up?',
    notSignedUp: 'Not signed up yet?',
    enterEmailForResetCode: 'Enter your email to receive a reset code'
  },
  ar: {
    welcome: 'مرحبا بكم في AgriSmart',
    dashboard: 'لوحة القيادة',
    profile: 'الملف الشخصي',
    settings: 'إعدادات',
    logout: 'تسجيل خروج',
    login: 'تسجيل الدخول',
    signup: 'التسجيل',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    name: 'الاسم',
    phoneNumber: 'رقم الهاتف',
    address: 'العنوان',
    bio: 'السيرة الذاتية',
    save: 'حفظ',
    cancel: 'إلغاء',
    delete: 'حذف',
    edit: 'تعديل',
    create: 'إنشاء',
    update: 'تحديث',
    confirmPassword: 'تأكيد كلمة المرور',
    forgotPassword: 'نسيت كلمة المرور؟',
    resetPassword: 'إعادة تعيين كلمة المرور',
    verifyEmail: 'التحقق من البريد الإلكتروني',
    sending: 'جاري الإرسال...',
    enterCodeSent: 'أدخل الرمز المرسل إلى بريدك الإلكتروني',
    codeRequired: 'الرمز مطلوب',
    verifyCode: 'التحقق من الرمز',
    verifying: 'جاري التحقق...',
    backToLogin: 'العودة إلى تسجيل الدخول',
    sendResetCode: 'إرسال رمز إعادة التعيين',
    resetCodeSent: 'تم إرسال تعليمات إعادة التعيين إلى بريدك الإلكتروني',
    resetCodeError: 'خطأ في طلب إعادة تعيين كلمة المرور',
    emailRequired: 'البريد الإلكتروني مطلوب',
    invalidEmailFormat: 'صيغة البريد الإلكتروني غير صالحة',
    passwordRequired: 'كلمة المرور مطلوبة',
    nameRequired: 'الاسم مطلوب',
    passwordMinLength: '6 أحرف على الأقل',
    passwordsDontMatch: 'كلمات المرور غير متطابقة',
    enterNewPassword: 'أدخل كلمة المرور الجديدة',
    createNewPassword: 'إنشاء كلمة مرور جديدة',
    alreadySignedUp: 'مسجل بالفعل؟',
    notSignedUp: 'لم تسجل بعد؟',
    enterEmailForResetCode: 'أدخل بريدك الإلكتروني لتلقي رمز إعادة التعيين'
  }
};

// Get language names for display
const languageNames: Record<LanguageCode, string> = {
  fr: 'Français',
  en: 'English',
  ar: 'العربية'
};

// Create the context
const LanguageContext = createContext<LanguageContextType>({
  currentLanguage: 'fr',
  changeLanguage: () => {},
  t: () => '',
  dir: 'ltr',
  languageName: 'Français'
});

// Create a provider component
export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [language, setLanguage] = useState<LanguageCode>(() => {
    // Try to get from localStorage first
    const savedLanguage = localStorage.getItem('language') as LanguageCode;
    // If not found, detect browser language or default to 'fr'
    if (savedLanguage && ['fr', 'en', 'ar'].includes(savedLanguage)) {
      return savedLanguage;
    }
    const browserLang = navigator.language.split('-')[0] as LanguageCode;
    return ['fr', 'en', 'ar'].includes(browserLang) ? browserLang : 'fr';
  });

  // Update language based on user preferences if logged in
  useEffect(() => {
    if (user?.preferences) {
      // Handle different types safely
      if (typeof user.preferences === 'object' && user.preferences !== null) {
        // Only update if the user has a language preference set
        if ('language' in user.preferences && user.preferences.language) {
          const userLang = user.preferences.language;
          if (typeof userLang === 'string' && ['fr', 'en', 'ar'].includes(userLang)) {
            setLanguage(userLang as LanguageCode);
            localStorage.setItem('language', userLang);
          }
        }
      }
    }
  }, [user]);

  // Change the language
  const changeLanguage = (lang: LanguageCode) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
    // Set document direction
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  };

  // Translation function
  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  // Direction based on language
  const dir = language === 'ar' ? 'rtl' : 'ltr';

  // Language name for display
  const languageName = languageNames[language];

  // Set document direction when language changes
  useEffect(() => {
    document.documentElement.dir = dir;
  }, [dir]);

  return (
    <LanguageContext.Provider value={{ currentLanguage: language, changeLanguage, t, dir, languageName }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Create a hook to use the language context
export const useLanguage = () => useContext(LanguageContext);
