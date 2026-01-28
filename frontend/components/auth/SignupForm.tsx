'use client';

/**
 * Signup form component
 */

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { FormInput } from '../ui/FormInput';
import { Button } from '../ui/Button';
import { ErrorMessage } from '../ui/ErrorMessage';
import { validateEmail, validatePassword } from '@/types/validation';

export function SignupForm() {
  const router = useRouter();
  const { signup } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setApiError('');
    setErrors({});

    // Validate form
    const newErrors: Record<string, string> = {};

    const emailError = validateEmail(email);
    if (emailError) newErrors.email = emailError;

    const passwordError = validatePassword(password);
    if (passwordError) newErrors.password = passwordError;

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Submit form
    setIsSubmitting(true);
    try {
      await signup(email, password);
      router.push('/tasks');
    } catch (error: any) {
      setApiError(error.message || 'Failed to create account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {apiError && <ErrorMessage>{apiError}</ErrorMessage>}

      <FormInput
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
        placeholder="you@example.com"
        required
        autoComplete="email"
      />

      <FormInput
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
        placeholder="At least 8 characters"
        required
        autoComplete="new-password"
      />

      <FormInput
        label="Confirm Password"
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        error={errors.confirmPassword}
        placeholder="Re-enter your password"
        required
        autoComplete="new-password"
      />

      <Button
        type="submit"
        fullWidth
        isLoading={isSubmitting}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Creating account...' : 'Sign Up'}
      </Button>
    </form>
  );
}
