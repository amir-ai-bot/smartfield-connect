
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { resetPassword } from '@/services/authService';
import { ResetPasswordFormData } from '@/types/auth';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

// Create schema for form validation
const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Password confirmation is required')
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export interface ResetPasswordFormProps {
  token?: string;
  email?: string;
  onSuccess?: () => void;
}

const ResetPasswordForm = ({ token = '', email = '', onSuccess }: ResetPasswordFormProps) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token,
      email,
      password: '',
      confirmPassword: ''
    },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    setLoading(true);
    try {
      const result = await resetPassword(data);
      if (result.error) {
        toast.error(result.error.message);
      } else {
        toast.success('Password reset successfully. You can now login with your new password.');
        if (onSuccess) {
          onSuccess();
        } else {
          navigate('/');
        }
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error('Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="token"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reset Token</FormLabel>
              <FormControl>
                <Input placeholder="Enter your reset token" {...field} disabled={!!token} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="Enter your email address" {...field} disabled={!!email} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Enter your new password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm New Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Confirm your new password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Resetting Password...' : 'Reset Password'}
        </Button>
      </form>
    </Form>
  );
};

export default ResetPasswordForm;
