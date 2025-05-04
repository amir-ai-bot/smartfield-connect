
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { signUp } from '@/services/authService';
import { SignupFormData } from '@/types/auth';

interface SignupFormProps {
  onSuccess: () => void;
  onBackToLogin: () => void;
}

const signupSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  confirm_password: z.string().min(6, 'La confirmation du mot de passe doit contenir au moins 6 caractères'),
  phone_number: z.string().optional()
}).refine((data) => data.password === data.confirm_password, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirm_password']
});

export function SignupForm({ onSuccess, onBackToLogin }: SignupFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirm_password: '',
      phone_number: ''
    }
  });

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      const { error: signUpError } = await signUp(
        data.name || '',
        data.email,
        data.password,
        data.phone_number
      );

      if (signUpError) {
        setError(signUpError.message);
      } else {
        onSuccess();
      }
    } catch (err) {
      setError('Une erreur est survenue lors de l\'inscription');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 py-2 pb-4">
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Input
            id="name"
            placeholder="Nom"
            disabled={isLoading}
            {...register('name')}
          />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Input
            id="phone_number"
            placeholder="Téléphone (optionnel)"
            disabled={isLoading}
            {...register('phone_number')}
          />
          {errors.phone_number && (
            <p className="text-sm text-red-500">{errors.phone_number.message}</p>
          )}
        </div>
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
            id="password"
            type="password"
            placeholder="Mot de passe"
            disabled={isLoading}
            {...register('password')}
          />
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Input
            id="confirm_password"
            type="password"
            placeholder="Confirmer le mot de passe"
            disabled={isLoading}
            {...register('confirm_password')}
          />
          {errors.confirm_password && (
            <p className="text-sm text-red-500">{errors.confirm_password.message}</p>
          )}
        </div>
        <div className="space-y-4 pt-2">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            S'inscrire
          </Button>
        </div>
      </form>
      <div className="text-center text-sm">
        <Button variant="link" onClick={onBackToLogin} disabled={isLoading} className="mt-2">
          Déjà un compte? Se connecter
        </Button>
      </div>
    </div>
  );
}

export default SignupForm;
