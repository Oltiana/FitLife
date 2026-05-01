import { useState } from 'react';
import { authApi } from '../api/authApi';
import { tokenStorage } from '../storage/tokenStorage';

export const useRegisterViewModel = (onSuccess: () => void) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    general: '',
  });

  const validateEmail = (val: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  const handleRegister = async () => {
    const newErrors = {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      general: '',
    };

    let hasError = false;

    if (!firstName) {
      newErrors.firstName = 'First name is required.';
      hasError = true;
    }

    if (!lastName) {
      newErrors.lastName = 'Last name is required.';
      hasError = true;
    }

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
    } else if (password.length < 8) {
      newErrors.password = 'Minimum 8 characters.';
      hasError = true;
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password.';
      hasError = true;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
      hasError = true;
    }

    setErrors(newErrors);
    if (hasError) return;

    try {
      setLoading(true);
      const fullName = `${firstName} ${lastName}`;
      const response = await authApi.register(fullName, email, password);

      await tokenStorage.saveAuth(response.token, response.refreshToken, {
        fullName: response.fullName,
        email: response.email,
        isVerified: response.isVerified,
      });

      onSuccess();
    } catch (err: any) {
      const message = err.message || '';
      if (message.includes('Email already exists')) {
        setErrors(prev => ({ ...prev, email: 'An account with this email already exists.' }));
      } else {
        setErrors(prev => ({ ...prev, general: 'Registration failed. Please try again.' }));
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    firstName, setFirstName,
    lastName, setLastName,
    email, setEmail,
    password, setPassword,
    confirmPassword, setConfirmPassword,
    loading, errors,
    showPassword, setShowPassword,
    showConfirmPassword, setShowConfirmPassword,
    handleRegister,
  };
};