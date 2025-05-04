
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { verifyEmail } from '@/services/authService';
import { VerifyEmailFormData } from '@/types/auth';

interface VerifyEmailFormProps {
  onSuccess: () => void;
  onBackToLogin: () => void;
  email?: string;
}

const verifyEmailSchema = z.object({
  email: z.string().email('Email invalide'),
  token: z.string().min(1, 'Le token est requis')
});

export function VerifyEmailForm({ onSuccess, onBackToLogin, email = '' }: VerifyEmailFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<VerifyEmailFormData>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      email: email,
      token: ''
    }
  });

  const onSubmit = async (data: VerifyEmailFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      await verifyEmail(data.email, data.token);
      onSuccess();
    } catch (err) {
      setError('Une erreur est survenue lors de la vérification d\'email');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 py-2 pb-4">
      <div className="text-center mb-4">
        <h2 className="text-lg font-medium">Vérification d'Email</h2>
        <p className="text-sm text-gray-500 mt-1">
          Entrez le token reçu par email pour vérifier votre compte
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
            disabled={isLoading || !!email}
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
        <div className="space-y-4 pt-2">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Vérifier
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

export default VerifyEmailForm;
