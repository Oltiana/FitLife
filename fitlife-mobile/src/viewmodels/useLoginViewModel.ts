import { useState } from 'react';
import { authApi } from '../api/authApi';
import { tokenStorage } from '../storage/tokenStorage';

export const useLoginViewModel = (onSuccess: () => void) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await authApi.login(email, password);

      await tokenStorage.saveAuth(response.token, response.refreshToken, {
        fullName: response.fullName,
        email: response.email,
        isVerified: response.isVerified,
      });

      onSuccess();
    } catch (err: any) {
      const message = err.message || '';

      if (message.includes('User not found')) {
        setError('No account found with this email.');
      } else if (message.includes('Invalid password')) {
        setError('Wrong password. Please try again.');
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    email, setEmail,
    password, setPassword,
    loading, error,
    showPassword, setShowPassword,
    handleLogin,
  };
};