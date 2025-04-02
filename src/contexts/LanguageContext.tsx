
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
    cancel: "Cancel",
    home: "Home",
    admin: "Admin",
    settings: "Settings",
    // Auth related translations
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm Password",
    forgotPassword: "Forgot Password?",
    resetPassword: "Reset Password",
    createNewPassword: "Create New Password",
    enterEmailForResetCode: "Enter your email to receive a reset code",
    enterCodeAndNewPassword: "Enter the code sent to your email and create a new password",
    sendResetCode: "Send Reset Code",
    resetCode: "Reset Code",
    newPassword: "New Password",
    passwordRequired: "Password is required",
    passwordMinLength: "Password must be at least 6 characters",
    confirmPasswordRequired: "Please confirm your password",
    passwordsDoNotMatch: "Passwords do not match",
    codeRequired: "Code is required",
    codeMustBe6Digits: "Code must be 6 digits",
    emailRequired: "Email is required",
    invalidEmailFormat: "Invalid email format",
    sending: "Sending...",
    resetting: "Resetting...",
    backToLogin: "Back to Login",
    resetCodeSent: "Reset code sent to your email",
    resetCodeError: "Error sending reset code",
    resetPasswordFailed: "Password reset failed"
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
    cancel: "Annuler",
    home: "Accueil",
    admin: "Admin",
    settings: "Paramètres",
    // Auth related translations
    email: "Email",
    password: "Mot de passe",
    confirmPassword: "Confirmer le mot de passe",
    forgotPassword: "Mot de passe oublié ?",
    resetPassword: "Réinitialiser le mot de passe",
    createNewPassword: "Créer un nouveau mot de passe",
    enterEmailForResetCode: "Entrez votre email pour recevoir un code de réinitialisation",
    enterCodeAndNewPassword: "Entrez le code envoyé à votre email et créez un nouveau mot de passe",
    sendResetCode: "Envoyer le code",
    resetCode: "Code de réinitialisation",
    newPassword: "Nouveau mot de passe",
    passwordRequired: "Le mot de passe est requis",
    passwordMinLength: "Le mot de passe doit contenir au moins 6 caractères",
    confirmPasswordRequired: "Veuillez confirmer votre mot de passe",
    passwordsDoNotMatch: "Les mots de passe ne correspondent pas",
    codeRequired: "Le code est requis",
    codeMustBe6Digits: "Le code doit contenir 6 chiffres",
    emailRequired: "L'email est requis",
    invalidEmailFormat: "Format d'email invalide",
    sending: "Envoi en cours...",
    resetting: "Réinitialisation...",
    backToLogin: "Retour à la connexion",
    resetCodeSent: "Code de réinitialisation envoyé à votre email",
    resetCodeError: "Erreur lors de l'envoi du code",
    resetPasswordFailed: "Échec de la réinitialisation du mot de passe"
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
    cancel: "إلغاء",
    home: "الرئيسية",
    admin: "المشرف",
    settings: "الإعدادات",
    // Auth related translations
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    confirmPassword: "تأكيد كلمة المرور",
    forgotPassword: "نسيت كلمة المرور؟",
    resetPassword: "إعادة تعيين كلمة المرور",
    createNewPassword: "إنشاء كلمة مرور جديدة",
    enterEmailForResetCode: "أدخل بريدك الإلكتروني لتلقي رمز إعادة التعيين",
    enterCodeAndNewPassword: "أدخل الرمز المرسل إلى بريدك الإلكتروني وأنشئ كلمة مرور جديدة",
    sendResetCode: "إرسال رمز إعادة التعيين",
    resetCode: "رمز إعادة التعيين",
    newPassword: "كلمة مرور جديدة",
    passwordRequired: "كلمة المرور مطلوبة",
    passwordMinLength: "يجب أن تتكون كلمة المرور من 6 أحرف على الأقل",
    confirmPasswordRequired: "يرجى تأكيد كلمة المرور",
    passwordsDoNotMatch: "كلمات المرور غير متطابقة",
    codeRequired: "الرمز مطلوب",
    codeMustBe6Digits: "يجب أن يتكون الرمز من 6 أرقام",
    emailRequired: "البريد الإلكتروني مطلوب",
    invalidEmailFormat: "تنسيق البريد الإلكتروني غير صالح",
    sending: "جاري الإرسال...",
    resetting: "جاري إعادة التعيين...",
    backToLogin: "العودة إلى تسجيل الدخول",
    resetCodeSent: "تم إرسال رمز إعادة التعيين إلى بريدك الإلكتروني",
    resetCodeError: "خطأ في إرسال رمز إعادة التعيين",
    resetPasswordFailed: "فشلت إعادة تعيين كلمة المرور"
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
      try {
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
      } catch (error) {
        console.error('Error getting user preferences:', error);
      }
    };

    getCurrentUserPreference();
  }, []);

  // Update language and save preference
  const changeLanguage = async (lang: LanguageType) => {
    try {
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
    } catch (error) {
      console.error('Error updating language preference:', error);
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
