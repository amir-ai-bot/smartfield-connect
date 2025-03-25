
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NewPasswordFormData } from '@/types/auth';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Lock, ArrowLeft } from 'lucide-react';

type ResetPasswordFormProps = {
  onSuccess?: () => void;
  onBackToLogin?: () => void;
};

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ 
  onSuccess,
  onBackToLogin
}) => {
  const { confirmPasswordReset } = useAuth();
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<NewPasswordFormData>();

  const onSubmit = async (data: NewPasswordFormData) => {
    try {
      await confirmPasswordReset(data.code, data.password);
      if (onSuccess) onSuccess();
    } catch (error) {
      // Error is handled in the auth context
      console.error('Password reset error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-4">
        <div className="text-center mb-4">
          <h3 className="text-lg font-medium">Créer un nouveau mot de passe</h3>
          <p className="text-sm text-gray-500 mt-1">
            Entrez le code reçu par email et votre nouveau mot de passe
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="code">Code de réinitialisation</Label>
          <Input
            id="code"
            type="text"
            placeholder="Code à 6 chiffres"
            {...register('code', { 
              required: 'Le code est requis',
              pattern: {
                value: /^\d{6}$/,
                message: 'Le code doit contenir 6 chiffres'
              }
            })}
          />
          {errors.code && (
            <p className="text-destructive text-sm">{errors.code.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Nouveau mot de passe</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="password"
              type="password"
              className="pl-10"
              placeholder="Nouveau mot de passe"
              {...register('password', { 
                required: 'Le mot de passe est requis',
                minLength: { value: 6, message: '6 caractères minimum' }
              })}
            />
          </div>
          {errors.password && (
            <p className="text-destructive text-sm">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="confirmPassword"
              type="password"
              className="pl-10"
              placeholder="Confirmer le mot de passe"
              {...register('confirmPassword', { 
                required: 'Veuillez confirmer le mot de passe',
                validate: value => value === watch('password') || 'Les mots de passe ne correspondent pas'
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
                Réinitialisation...
              </>
            ) : (
              'Réinitialiser le mot de passe'
            )}
          </Button>
          
          <Button
            type="button"
            variant="outline"
            onClick={onBackToLogin}
            className="w-full"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à la connexion
          </Button>
        </div>
      </div>
    </form>
  );
};

export default ResetPasswordForm;
