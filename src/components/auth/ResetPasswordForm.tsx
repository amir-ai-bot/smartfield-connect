
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NewPasswordFormData } from '@/types/auth';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Loader2, Lock, ArrowLeft } from 'lucide-react';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { toast } from 'sonner';
import { useSearchParams } from 'react-router-dom';

type ResetPasswordFormProps = {
  onSuccess?: () => void;
  onBackToLogin?: () => void;
};

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ 
  onSuccess,
  onBackToLogin
}) => {
  const { confirmPasswordReset } = useAuth();
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<NewPasswordFormData>();
  const [code, setCode] = useState('');
  const [useDirectInput, setUseDirectInput] = useState(false);
  
  // Auto-fill code from URL parameter
  useEffect(() => {
    const codeFromUrl = searchParams.get('code');
    if (codeFromUrl) {
      console.log("Code found in URL:", codeFromUrl);
      setCode(codeFromUrl);
      setValue('code', codeFromUrl);
    }
  }, [searchParams, setValue]);

  const onSubmit = async (data: NewPasswordFormData) => {
    try {
      if (!data.code || data.code.length !== 6) {
        toast.error(t('codeMustBe6Digits'));
        return;
      }
      
      console.log("Submitting reset with code:", data.code);
      await confirmPasswordReset(data.code, data.password);
      if (onSuccess) onSuccess();
    } catch (error) {
      // Error is handled in the auth context
      console.error('Password reset error:', error);
      toast.error(t('resetPasswordFailed'));
    }
  };

  const handleOTPChange = (value: string) => {
    try {
      setCode(value);
      setValue('code', value);
    } catch (error) {
      console.error('OTP change error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-4">
        <div className="text-center mb-4">
          <h3 className="text-lg font-medium">{t('createNewPassword')}</h3>
          <p className="text-sm text-gray-500 mt-1">
            {t('enterCodeAndNewPassword')}
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="code" className="block text-center">{t('resetCode')}</Label>
          
          {!useDirectInput ? (
            <>
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={code}
                  onChange={handleOTPChange}
                  render={({ slots }) => (
                    <InputOTPGroup className="gap-2">
                      {slots.map((slot, index) => (
                        <InputOTPSlot key={index} {...slot} index={index} className="w-10 h-12" />
                      ))}
                    </InputOTPGroup>
                  )}
                />
              </div>
              
              <div className="text-center mt-2">
                <Button
                  type="button"
                  variant="link"
                  className="text-xs p-0"
                  onClick={() => setUseDirectInput(true)}
                >
                  Problèmes avec le champ? Cliquez ici pour saisir manuellement
                </Button>
              </div>
            </>
          ) : (
            <div className="flex justify-center">
              <Input
                className="text-center w-full max-w-[250px]"
                placeholder="Entrez le code à 6 chiffres"
                maxLength={6}
                value={code}
                onChange={(e) => {
                  const value = e.target.value;
                  setCode(value);
                  setValue('code', value);
                }}
              />
            </div>
          )}
          
          <input 
            type="hidden" 
            {...register('code', { 
              required: t('codeRequired'),
              pattern: {
                value: /^\d{6}$/,
                message: t('codeMustBe6Digits')
              }
            })} 
          />
          
          {errors.code && (
            <p className="text-destructive text-sm text-center mt-2">{errors.code.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">{t('newPassword')}</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="password"
              type="password"
              className="pl-10"
              placeholder={t('newPassword')}
              {...register('password', { 
                required: t('passwordRequired'),
                minLength: { value: 6, message: t('passwordMinLength') }
              })}
            />
          </div>
          {errors.password && (
            <p className="text-destructive text-sm">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="confirmPassword"
              type="password"
              className="pl-10"
              placeholder={t('confirmPassword')}
              {...register('confirmPassword', { 
                required: t('confirmPasswordRequired'),
                validate: value => value === watch('password') || t('passwordsDoNotMatch')
              })}
            />
          </div>
          {errors.confirmPassword && (
            <p className="text-destructive text-sm">{errors.confirmPassword.message}</p>
          )}
        </div>

        <div className="pt-4 flex flex-col space-y-4">
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('resetting')}
              </>
            ) : (
              t('resetPassword')
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

export default ResetPasswordForm;
