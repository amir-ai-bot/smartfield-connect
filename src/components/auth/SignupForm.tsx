
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SignupFormData } from '@/types/auth';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, User, Mail, Lock, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

type SignupFormProps = {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
  onSwitchToForgotPassword?: () => void;
};

const SignupForm: React.FC<SignupFormProps> = ({ 
  onSuccess, 
  onSwitchToLogin,
  onSwitchToForgotPassword
}) => {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm<SignupFormData>();

  const onSubmit = async (data: SignupFormData) => {
    if (data.password !== data.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await signUp(data.name, data.email, data.password, data.phone_number);
      toast.success('Inscription réussie! Veuillez vérifier votre email.');
      if (onSuccess) onSuccess();
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Signup form error:', error);
      toast.error(error?.message || 'Erreur lors de l\'inscription');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nom complet</Label>
        <div className="relative">
          <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="name"
            type="text"
            className="pl-10"
            placeholder="Votre nom"
            {...register('name', { 
              required: 'Le nom est requis',
              minLength: { value: 2, message: '2 caractères minimum' }
            })}
          />
        </div>
        {errors.name && (
          <p className="text-destructive text-sm">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="email"
            type="email"
            className="pl-10"
            placeholder="votre@email.com"
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
        <Label htmlFor="phone_number">Numéro de téléphone</Label>
        <div className="relative">
          <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="phone_number"
            type="tel"
            className="pl-10"
            placeholder="+33 6 12 34 56 78"
            {...register('phone_number', { 
              required: 'Le numéro de téléphone est requis'
            })}
          />
        </div>
        {errors.phone_number && (
          <p className="text-destructive text-sm">{errors.phone_number.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Mot de passe</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="password"
            type="password"
            className="pl-10"
            placeholder="Mot de passe"
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
        <Button 
          type="submit" 
          disabled={isSubmitting} 
          className="w-full"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Inscription...
            </>
          ) : (
            'S\'inscrire'
          )}
        </Button>
        
        <div className="text-center text-sm">
          <span className="text-gray-500">Déjà inscrit? </span>
          <Button
            type="button"
            variant="link"
            onClick={onSwitchToLogin}
            className="p-0 h-auto font-normal"
          >
            Se connecter
          </Button>
        </div>
      </div>
    </form>
  );
};

export default SignupForm;
