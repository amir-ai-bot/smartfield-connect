
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ResetPasswordFormData } from '@/types/auth';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
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
  const { resetPassword } = useAuth();
  const [searchParams] = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm<ResetPasswordFormData>({
    defaultValues: {
      token: searchParams.get('token') || '',
      email: searchParams.get('email') || '',
    }
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (data.password !== data.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await resetPassword(data.token, data.password);
      toast.success('Mot de passe réinitialisé avec succès');
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error('Reset password error:', error);
      toast.error(error?.message || 'Erreur lors de la réinitialisation du mot de passe');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="token">Code de réinitialisation</Label>
        <Input
          id="token"
          type="text"
          placeholder="Entrez le code reçu par email"
          {...register('token', { required: 'Le code est requis' })}
        />
        {errors.token && (
          <p className="text-destructive text-sm">{errors.token.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="votre@email.com"
          {...register('email', { 
            required: 'L\'email est requis',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Format d\'email invalide'
            }
          })}
        />
        {errors.email && (
          <p className="text-destructive text-sm">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Nouveau mot de passe</Label>
        <Input
          id="password"
          type="password"
          placeholder="Nouveau mot de passe"
          {...register('password', { 
            required: 'Le mot de passe est requis',
            minLength: { value: 6, message: '6 caractères minimum' }
          })}
        />
        {errors.password && (
          <p className="text-destructive text-sm">{errors.password.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="Confirmer le mot de passe"
          {...register('confirmPassword', { 
            required: 'Veuillez confirmer le mot de passe',
            validate: value => value === watch('password') || 'Les mots de passe ne correspondent pas'
          })}
        />
        {errors.confirmPassword && (
          <p className="text-destructive text-sm">{errors.confirmPassword.message}</p>
        )}
      </div>

      <div className="pt-4 flex flex-col space-y-4">
        <Button 
          type="submit" 
          disabled={isSubmitting} 
          className="w-full"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Réinitialisation...
            </>
          ) : (
            'Réinitialiser le mot de passe'
          )}
        </Button>
        
        <div className="text-center text-sm">
          <span className="text-gray-500">Vous vous souvenez de votre mot de passe? </span>
          <Button
            type="button"
            variant="link"
            onClick={onBackToLogin}
            className="p-0 h-auto font-normal"
          >
            Se connecter
          </Button>
        </div>
      </div>
    </form>
  );
};

export default ResetPasswordForm;
