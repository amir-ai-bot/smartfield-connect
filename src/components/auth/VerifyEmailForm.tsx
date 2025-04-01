
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { VerifyEmailFormData } from '@/types/auth';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { toast } from 'sonner';

type VerifyEmailFormProps = {
  email: string;
  onSuccess?: () => void;
  onCancel?: () => void;
};

const VerifyEmailForm: React.FC<VerifyEmailFormProps> = ({ 
  email,
  onSuccess,
  onCancel
}) => {
  const { verifyEmail } = useAuth();
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<VerifyEmailFormData>({
    defaultValues: {
      code: ''
    }
  });
  
  const code = watch('code');
  const [useDirectInput, setUseDirectInput] = useState(false);
  const [resendingCode, setResendingCode] = useState(false);

  const onSubmit = async (data: VerifyEmailFormData) => {
    try {
      await verifyEmail(email, data.code);
      toast.success('Email vérifié avec succès');
      if (onSuccess) onSuccess();
    } catch (error) {
      // Error is handled in the auth context
      console.error('Email verification error:', error);
      toast.error('Erreur de vérification: Veuillez vérifier votre code');
    }
  };

  const handleOTPChange = (value: string) => {
    setValue('code', value);
  };

  const handleResendCode = async () => {
    try {
      setResendingCode(true);
      // Use the signup email service to resend the code
      // This is just a placeholder, implement the actual resend logic
      console.log('Resend code to', email);
      toast.success('Un nouveau code a été envoyé à votre email');
    } catch (error) {
      console.error('Error resending code:', error);
      toast.error('Erreur lors de l\'envoi du code');
    } finally {
      setResendingCode(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-4">
        <div className="text-center mb-6">
          <h3 className="text-lg font-medium">Vérifiez votre email</h3>
          <p className="text-sm text-gray-500 mt-1">
            Nous avons envoyé un code à <span className="font-medium">{email}</span>
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="code" className="block text-center mb-4">Code de vérification</Label>
          
          {!useDirectInput ? (
            <>
              <div className="flex justify-center">
                <InputOTP 
                  maxLength={6}
                  value={code}
                  onChange={handleOTPChange}
                  render={({ slots }) => (
                    <InputOTPGroup className="gap-2">
                      {Array.isArray(slots) && slots.map((slot, index) => (
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
                onChange={(e) => setValue('code', e.target.value)}
              />
            </div>
          )}
          
          <input 
            type="hidden" 
            {...register('code', { 
              required: 'Le code est requis',
              pattern: {
                value: /^\d{6}$/,
                message: 'Le code doit contenir 6 chiffres'
              }
            })} 
          />
          
          {errors.code && (
            <p className="text-destructive text-sm text-center mt-2">{errors.code.message}</p>
          )}
        </div>

        <div className="pt-6 flex flex-col space-y-4">
          <Button type="submit" disabled={isSubmitting || code.length !== 6} className="w-full">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Vérification...
              </>
            ) : (
              'Vérifier'
            )}
          </Button>
          
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="w-full"
            >
              Je vérifierai plus tard
            </Button>
          )}
          
          <div className="text-center text-sm">
            <span className="text-gray-500">Vous n'avez pas reçu de code? </span>
            <Button
              type="button"
              variant="link"
              className="p-0 h-auto font-normal"
              onClick={handleResendCode}
              disabled={resendingCode}
            >
              {resendingCode ? (
                <>
                  <Loader2 className="mr-1 h-3 w-3 animate-spin inline" />
                  Envoi en cours...
                </>
              ) : (
                'Renvoyer'
              )}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default VerifyEmailForm;
