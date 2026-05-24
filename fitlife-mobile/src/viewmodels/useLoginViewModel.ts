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

      const token = response?.token ?? response?.Token;
      const refreshToken = response?.refreshToken ?? response?.RefreshToken;
      if (!token || !refreshToken) {
        throw new Error('Server response missing token. Check API is running.');
      }

      await tokenStorage.saveAuth(token, refreshToken, {
  fullName: response.fullName ?? response.FullName ?? '',
  email: response.email ?? response.Email ?? email,
  isVerified: response.isVerified ?? response.IsVerified ?? false,
}, response.role ?? response.Role ?? 'User');

      onSuccess();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      const lower = message.toLowerCase();

      if (message.includes('User not found')) {
        setErrors(prev => ({ ...prev, email: 'No account found with this email.' }));
      } else if (message.includes('Invalid password')) {
        setErrors(prev => ({ ...prev, password: 'Wrong password. Please try again.' }));
      } else if (
        lower.includes('network request failed') ||
        lower.includes('failed to fetch') ||
        lower.includes('network error')
      ) {
        setErrors(prev => ({
          ...prev,
          general:
            'Cannot reach API. Start FitLifeAPI (dotnet run), set MOBILE_API_IP in apiConfig.ts to your PC Wi‑Fi IP, and use 10.0.2.2 on Android emulator.',
        }));
      } else if (message.trim().length > 0) {
        setErrors(prev => ({ ...prev, general: message.slice(0, 200) }));
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