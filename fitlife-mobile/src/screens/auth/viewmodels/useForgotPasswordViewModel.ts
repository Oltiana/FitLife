import { useState } from 'react';
import { authApi } from '../../../api/authApi';

export const useForgotPasswordViewModel = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState<'email' | 'code' | 'password'>('email');
  const [email, setEmail] = useState('');
  const [verifiedCode, setVerifiedCode] = useState('');

  const validateEmail = (emailInput: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(emailInput);
  };

  const handleSendCode = async (emailInput: string) => {
    if (!emailInput.trim()) {
      setError('Please enter your email.');
      return;
    }
    if (!validateEmail(emailInput.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    try {
      setLoading(true);
      setError('');
      await authApi.forgotPassword(emailInput.trim());
      setEmail(emailInput.trim());
      setStep('code');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (code: string) => {
    if (code.length < 6) {
      setError('Please enter the 6-digit code.');
      return;
    }
    try {
      setLoading(true);
      setError('');
      await authApi.verifyResetCode(code);
      setVerifiedCode(code);
      setStep('password');
    } catch {
      setError('Invalid or expired code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (newPassword: string, confirmPassword: string) => {
    if (!newPassword.trim()) {
      setError('Please enter a new password.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    try {
      setLoading(true);
      setError('');
      await authApi.resetPassword(verifiedCode, newPassword);
      setSuccess(true);
    } catch {
      setError('Something went wrong. Please try again.');
      setStep('code');
      setVerifiedCode('');
    } finally {
      setLoading(false);
    }
  };

  const resetToEmail = () => {
    setStep('email');
    setEmail('');
    setError('');
    setVerifiedCode('');
  };

  return {
    loading,
    error,
    success,
    step,
    email,
    handleSendCode,
    handleVerifyCode,
    handleResetPassword,
    resetToEmail,
  };
};