/**
 * @module pages/auth/signup
 * @description Signup page
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '@/entities/session';
import { SignupForm } from '@/features/auth/signup';

export function SignupPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useSession();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSuccess = () => {
    navigate('/dashboard');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 px-4">
      <SignupForm onSuccess={handleSuccess} />
    </div>
  );
}
