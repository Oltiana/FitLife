import { useState } from 'react';
import { authApi } from '../api/authApi';

export const useVerifyEmailViewModel = (onSuccess: () => void) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleVerify = async (code: string) => {
    if (code.length < 6) {
      setError('Please enter the 6-digit code.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await authApi.verifyEmail(code);
      setSuccess(true);
      setTimeout(() => onSuccess(), 1500); 
    } catch {
      setError('Invalid or expired code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async (email: string) => {
    try {
      await authApi.forgotPassword(email); 
    } catch {}
  };

  return { loading, error, success, handleVerify, handleResend };
};