import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoginFormData } from '@/types/auth';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Mail, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

type LoginFormProps = {
  onSuccess?: () => void;
  onSwitchToSignup?: () => void;
  onSwitchToForgotPassword?: () => void;
};

const LoginForm: React.FC<LoginFormProps> = ({ 
  onSuccess, 
  onSwitchToSignup,
  onSwitchToForgotPassword
}) => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    if (isLoggingIn) return;
    
    setIsLoggingIn(true);
    const loadingToast = toast.loading('Connexion en cours...');

    try {
      // Try direct Supabase login first
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) throw error;

      // If successful, complete the login process
      await login(data.email, data.password);
      
      toast.dismiss(loadingToast);
      toast.success('Connexion réussie');
      
      if (onSuccess) onSuccess();
      navigate('/dashboard', { replace: true });
    } catch (error: any) {
      console.error('Login error:', error);
      toast.dismiss(loadingToast);
      toast.error(error.message === 'Invalid login credentials'
        ? 'Email ou mot de passe incorrect'
        : 'Erreur lors de la connexion'
      );
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="email"
            type="email"
            className="pl-10"
            placeholder="votre@email.com"
            autoComplete="email"
            disabled={isLoggingIn}
            {...register('email', { 
              required: 'L\'email est requis',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Format d\'email invalide'
              }
            })}
          />
        </div>
        {errors.email && (
          <p className="text-destructive text-sm">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="password">Mot de passe</Label>
          <Button
            type="button"
            variant="link"
            onClick={onSwitchToForgotPassword}
            disabled={isLoggingIn}
            className="p-0 h-auto font-normal text-xs"
          >
            Mot de passe oublié?
          </Button>
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="password"
            type="password"
            className="pl-10"
            placeholder="Mot de passe"
            autoComplete="current-password"
            disabled={isLoggingIn}
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

      <div className="pt-4 flex flex-col space-y-4">
        <Button 
          type="submit" 
          disabled={isLoggingIn} 
          className="w-full bg-agri-green-500 hover:bg-agri-green-600"
        >
          {isLoggingIn ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connexion...
            </>
          ) : (
            'Se connecter'
          )}
        </Button>
        
        <div className="text-center text-sm">
          <span className="text-gray-500">Pas encore de compte? </span>
          <Button
            type="button"
            variant="link"
            onClick={onSwitchToSignup}
            disabled={isLoggingIn}
            className="p-0 h-auto font-normal"
          >
            S'inscrire
          </Button>
        </div>
      </div>
    </form>
  );
};

export default LoginForm;
