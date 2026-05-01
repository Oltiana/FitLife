import { useState } from 'react';
import { authApi } from '../api/authApi';
import { tokenStorage } from '../storage/tokenStorage';

export const useLoginViewModel = (onSuccess: () => void) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState({
    email: '',
    password: '',
    general: '',
  });

  const validateEmail = (val: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  const handleLogin = async () => {
    const newErrors = { email: '', password: '', general: '' };
    let hasError = false;

    if (!email) {
      newErrors.email = 'Email is required.';
      hasError = true;
    } else if (!validateEmail(email)) {
      newErrors.email = 'Invalid email address.';
      hasError = true;
    }

    if (!password) {
      newErrors.password = 'Password is required.';
      hasError = true;
    }

    setErrors(newErrors);
    if (hasError) return;

    try {
      setLoading(true);
      setErrors({ email: '', password: '', general: '' });

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
        setErrors(prev => ({ ...prev, email: 'No account found with this email.' }));
      } else if (message.includes('Invalid password')) {
        setErrors(prev => ({ ...prev, password: 'Wrong password. Please try again.' }));
      } else {
        setErrors(prev => ({ ...prev, general: 'Login failed. Please try again.' }));
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    email, setEmail,
    password, setPassword,
    loading, errors,
    showPassword, setShowPassword,
    handleLogin,
  };
};