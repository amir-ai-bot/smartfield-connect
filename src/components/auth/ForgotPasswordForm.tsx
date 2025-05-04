import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Loader2, Mail, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

type ForgotPasswordFormProps = {
  onSuccess?: (email: string) => void;
  onBackToLogin?: () => void;
};

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ 
  onSuccess,
  onBackToLogin
}) => {
  const { requestPasswordReset } = useAuth();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<{ email: string }>();

  const onSubmit = async (data: { email: string }) => {
    try {
      setIsLoading(true);
      console.log('Requesting password reset for email:', data.email);
      await requestPasswordReset(data.email);
      toast.success(t('resetCodeSent'));
      if (onSuccess) onSuccess(data.email);
    } catch (error) {
      console.error('Password reset request error:', error);
      toast.error(t('resetCodeError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-4">
        <div className="text-center mb-4">
          <h3 className="text-lg font-medium">{t('resetPassword')}</h3>
          <p className="text-sm text-gray-500 mt-1">
            {t('enterEmailForResetCode')}
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">{t('email')}</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="email"
              type="email"
              className="pl-10"
              placeholder="votre@email.com"
              {...register('email', { 
                required: t('emailRequired'),
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: t('invalidEmailFormat')
                }
              })}
            />
          </div>
          {errors.email && (
            <p className="text-destructive text-sm">{errors.email.message}</p>
          )}
        </div>

        <div className="pt-4 flex flex-col space-y-4">
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('sending')}
              </>
            ) : (
              t('sendResetCode')
            )}
          </Button>
          
          <Button
            type="button"
            variant="outline"
            onClick={onBackToLogin}
            className="w-full"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('backToLogin')}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default ForgotPasswordForm;
