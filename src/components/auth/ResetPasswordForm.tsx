
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { resetPassword } from '@/services/authService';
import { ResetPasswordFormData } from '@/types/auth';

interface ResetPasswordFormProps {
  onSuccess: () => void;
  onBackToLogin: () => void;
}

const resetPasswordSchema = z.object({
  email: z.string().email('Email invalide'),
  token: z.string().min(1, 'Le token est requis'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  confirmPassword: z.string().min(6, 'La confirmation du mot de passe doit contenir au moins 6 caractères')
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword']
});

export function ResetPasswordForm({ onSuccess, onBackToLogin }: ResetPasswordFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: '',
      token: '',
      password: '',
      confirmPassword: ''
    }
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      const { error: resetError } = await resetPassword(data);
      if (resetError) {
        setError(resetError.message);
      } else {
        onSuccess();
      }
    } catch (err) {
      setError('Une erreur est survenue lors de la réinitialisation du mot de passe');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 py-2 pb-4">
      <div className="text-center mb-4">
        <h2 className="text-lg font-medium">Réinitialiser le mot de passe</h2>
        <p className="text-sm text-gray-500 mt-1">
          Entrez votre nouveau mot de passe
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Input
            id="email"
            type="email"
            placeholder="Email"
            disabled={isLoading}
            {...register('email')}
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Input
            id="token"
            placeholder="Token"
            disabled={isLoading}
            {...register('token')}
          />
          {errors.token && (
            <p className="text-sm text-red-500">{errors.token.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Input
            id="password"
            type="password"
            placeholder="Nouveau mot de passe"
            disabled={isLoading}
            {...register('password')}
          />
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Confirmer le mot de passe"
            disabled={isLoading}
            {...register('confirmPassword')}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
          )}
        </div>
        <div className="space-y-4 pt-2">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Réinitialiser
          </Button>
        </div>
      </form>
      <div className="text-center text-sm">
        <Button variant="link" onClick={onBackToLogin} disabled={isLoading} className="mt-2">
          Retourner à la connexion
        </Button>
      </div>
    </div>
  );
}

export default ResetPasswordForm;
