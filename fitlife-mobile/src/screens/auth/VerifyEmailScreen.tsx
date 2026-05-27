import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useVerifyEmailViewModel } from '../../viewmodels/useVerifyEmailViewModel';

export default function VerifyEmailScreen({
  email,
  onVerifySuccess,
  onNavigateToLogin,
}: {
  email: string;
  onVerifySuccess: () => void;
  onNavigateToLogin: () => void;
}) {
  const { loading, error, success, handleVerify, handleResend } =
    useVerifyEmailViewModel(onVerifySuccess);

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const inputs = useRef<TextInput[]>([]);

  const handleChange = (val: string, index: number) => {
    if (!/^\d*$/.test(val)) return; 
    const newCode = [...code];
    newCode[index] = val;
    setCode(newCode);

    if (val && index < 5) inputs.current[index + 1]?.focus();

    if (index === 5 && val) {
      const fullCode = [...newCode].join('');
      if (fullCode.length === 6) handleVerify(fullCode);
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.inner}>

        <View style={styles.iconContainer}>
          <Ionicons name="mail-open-outline" size={40} color="#5A8A5A" />
        </View>

        <Text style={styles.title}>Verify your email</Text>
        <Text style={styles.subtitle}>
          We sent a 6-digit code to{'\n'}
          <Text style={styles.email}>{email}</Text>
        </Text>

        <View style={styles.codeContainer}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={ref => { if (ref) inputs.current[index] = ref; }}
              style={[styles.codeInput, digit ? styles.codeInputFilled : null]}
              value={digit}
              onChangeText={val => handleChange(val, index)}
              onKeyPress={e => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              textAlign="center"
              selectTextOnFocus
            />
          ))}
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {success ? <Text style={styles.successText}>Email verified! Redirecting...</Text> : null}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={() => handleVerify(code.join(''))}
          disabled={loading || code.join('').length < 6}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.buttonText}>Verify Email</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity style={styles.resendWrapper} onPress={() => handleResend(email)}>
          <Text style={styles.resendText}>
            Didn't receive the code?{' '}
            <Text style={styles.resendLink}>Resend</Text>
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onNavigateToLogin}>
          <Text style={styles.loginText}>Back to Login</Text>
        </TouchableOpacity>

      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  inner: { flex: 1, paddingHorizontal: 24, paddingTop: 80, alignItems: 'center' },

  iconContainer: {
    width: 72, height: 72,
    backgroundColor: '#E8F5E9',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },

  title: { fontSize: 24, fontWeight: '700', color: '#1A1A1A', marginBottom: 12 },
  subtitle: { fontSize: 14, color: '#555', textAlign: 'center', marginBottom: 32, lineHeight: 22 },
  email: { fontWeight: '700', color: '#1A1A1A' },

  codeContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },

  codeInput: {
    width: 48, height: 56,
    backgroundColor: '#F2F2F2',
    borderRadius: 10,
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
    borderWidth: 1,
    borderColor: 'transparent',
  },

  codeInputFilled: {
    borderColor: '#7DBF7A',
    backgroundColor: '#F0FAF0',
  },

  button: {
    backgroundColor: '#7DBF7A',
    borderRadius: 12,
    height: 52,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  errorText: { color: '#E53935', fontSize: 13, marginBottom: 12 },
  successText: { color: '#1A6B3A', fontSize: 13, marginBottom: 12 },

  resendWrapper: { marginBottom: 16 },
  resendText: { color: '#555', fontSize: 13 },
  resendLink: { color: '#7DBF7A', fontWeight: '700' },

  loginText: { color: '#999', fontSize: 13 },
});