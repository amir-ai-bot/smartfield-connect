
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

// Define available languages
export type Language = 'fr' | 'en' | 'ar';

// Define translation key structure for TypeScript
interface TranslationKeys {
  [key: string]: {
    fr: string;
    en: string;
    ar: string;
  };
}

// Create translations object
const translations: TranslationKeys = {
  // Auth translations
  login: {
    fr: 'Connexion',
    en: 'Login',
    ar: 'تسجيل الدخول'
  },
  signup: {
    fr: 'Inscription',
    en: 'Sign Up',
    ar: 'التسجيل'
  },
  email: {
    fr: 'Email',
    en: 'Email',
    ar: 'البريد الإلكتروني'
  },
  password: {
    fr: 'Mot de passe',
    en: 'Password',
    ar: 'كلمة المرور'
  },
  forgotPassword: {
    fr: 'Mot de passe oublié?',
    en: 'Forgot Password?',
    ar: 'نسيت كلمة المرور؟'
  },
  resetPassword: {
    fr: 'Réinitialiser le mot de passe',
    en: 'Reset Password',
    ar: 'إعادة تعيين كلمة المرور'
  },
  sendResetCode: {
    fr: 'Envoyer le code',
    en: 'Send Reset Code',
    ar: 'إرسال رمز إعادة التعيين'
  },
  resetCodeSent: {
    fr: 'Code envoyé! Vérifiez votre email.',
    en: 'Code sent! Check your email.',
    ar: 'تم إرسال الرمز! تحقق من بريدك الإلكتروني.'
  },
  resetCodeError: {
    fr: 'Erreur lors de l\'envoi du code',
    en: 'Error sending reset code',
    ar: 'خطأ في إرسال رمز إعادة التعيين'
  },
  emailRequired: {
    fr: 'L\'email est requis',
    en: 'Email is required',
    ar: 'البريد الإلكتروني مطلوب'
  },
  invalidEmailFormat: {
    fr: 'Format d\'email invalide',
    en: 'Invalid email format',
    ar: 'تنسيق البريد الإلكتروني غير صالح'
  },
  passwordRequired: {
    fr: 'Le mot de passe est requis',
    en: 'Password is required',
    ar: 'كلمة المرور مطلوبة'
  },
  passwordMinLength: {
    fr: '6 caractères minimum',
    en: '6 characters minimum',
    ar: '6 أحرف كحد أدنى'
  },
  confirmPasswordRequired: {
    fr: 'Veuillez confirmer le mot de passe',
    en: 'Please confirm password',
    ar: 'يرجى تأكيد كلمة المرور'
  },
  passwordsDoNotMatch: {
    fr: 'Les mots de passe ne correspondent pas',
    en: 'Passwords do not match',
    ar: 'كلمات المرور غير متطابقة'
  },
  enterEmailForResetCode: {
    fr: 'Entrez votre email pour recevoir un code de réinitialisation',
    en: 'Enter your email to receive a reset code',
    ar: 'أدخل بريدك الإلكتروني لتلقي رمز إعادة التعيين'
  },
  sending: {
    fr: 'Envoi en cours...',
    en: 'Sending...',
    ar: 'جاري الإرسال...'
  },
  backToLogin: {
    fr: 'Retour à la connexion',
    en: 'Back to Login',
    ar: 'العودة إلى تسجيل الدخول'
  },
  createNewPassword: {
    fr: 'Créer un nouveau mot de passe',
    en: 'Create New Password',
    ar: 'إنشاء كلمة مرور جديدة'
  },
  enterCodeAndNewPassword: {
    fr: 'Entrez le code reçu et votre nouveau mot de passe',
    en: 'Enter the code received and your new password',
    ar: 'أدخل الرمز المستلم وكلمة المرور الجديدة'
  },
  resetCode: {
    fr: 'Code de réinitialisation',
    en: 'Reset Code',
    ar: 'رمز إعادة التعيين'
  },
  newPassword: {
    fr: 'Nouveau mot de passe',
    en: 'New Password',
    ar: 'كلمة المرور الجديدة'
  },
  confirmPassword: {
    fr: 'Confirmer le mot de passe',
    en: 'Confirm Password',
    ar: 'تأكيد كلمة المرور'
  },
  codeRequired: {
    fr: 'Le code est requis',
    en: 'Code is required',
    ar: 'الرمز مطلوب'
  },
  codeMustBe6Digits: {
    fr: 'Le code doit contenir 6 chiffres',
    en: 'Code must be 6 digits',
    ar: 'يجب أن يتكون الرمز من 6 أرقام'
  },
  resetting: {
    fr: 'Réinitialisation...',
    en: 'Resetting...',
    ar: 'جاري إعادة التعيين...'
  },
  resetPasswordFailed: {
    fr: 'Échec de la réinitialisation du mot de passe',
    en: 'Failed to reset password',
    ar: 'فشل في إعادة تعيين كلمة المرور'
  }
};

// Define context type
interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: () => 'ltr' | 'rtl';
}

// Create context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Create provider component
export const LanguageProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const { user } = useAuth();
  const [language, setLanguage] = useState<Language>('fr');

  // Load language preference from localStorage or user profile
  useEffect(() => {
    const loadLanguagePreference = async () => {
      // First check localStorage
      const storedLanguage = localStorage.getItem('language') as Language | null;
      
      if (storedLanguage && (storedLanguage === 'fr' || storedLanguage === 'en' || storedLanguage === 'ar')) {
        setLanguage(storedLanguage);
        document.documentElement.lang = storedLanguage;
        document.documentElement.dir = storedLanguage === 'ar' ? 'rtl' : 'ltr';
        return;
      }
      
      // Then check user preferences if user is authenticated
      if (user) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('preferences')
            .eq('id', user.id)
            .single();
            
          if (error) throw error;
          
          if (data && data.preferences) {
            const userLang = data.preferences.language;
            if (userLang && (userLang === 'fr' || userLang === 'en' || userLang === 'ar')) {
              setLanguage(userLang);
              localStorage.setItem('language', userLang);
              document.documentElement.lang = userLang;
              document.documentElement.dir = userLang === 'ar' ? 'rtl' : 'ltr';
            }
          }
        } catch (error) {
          console.error('Error loading language preference:', error);
        }
      }
    };
    
    loadLanguagePreference();
  }, [user]);
  
  // Save language preference when it changes
  const saveLanguagePreference = async (lang: Language) => {
    // Save to localStorage
    localStorage.setItem('language', lang);
    
    // If user is authenticated, save to profile
    if (user) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({
            preferences: {
              language: lang,
              // We need to use any here to prevent the spread type error
              ...(user.preferences as any || {})
            }
          })
          .eq('id', user.id);
          
        if (error) throw error;
      } catch (error) {
        console.error('Error saving language preference:', error);
      }
    }
    
    // Update document language and direction
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  };
  
  // Handle language change
  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    saveLanguagePreference(lang);
  };
  
  // Translation function
  const t = (key: string): string => {
    if (translations[key]) {
      return translations[key][language];
    }
    return key;
  };
  
  // Direction helper
  const dir = (): 'ltr' | 'rtl' => {
    return language === 'ar' ? 'rtl' : 'ltr';
  };
  
  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Create custom hook for using language
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  
  return context;
};
