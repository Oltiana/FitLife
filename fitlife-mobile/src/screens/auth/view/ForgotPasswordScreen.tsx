import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useForgotPasswordViewModel } from '../viewmodels/useForgotPasswordViewModel';

export default function ForgotPasswordScreen({
  onNavigateToLogin,
  onResetSuccess,
}: {
  onNavigateToLogin: () => void;
  onResetSuccess: () => void;
}) {
  const {
    loading,
    error,
    success,
    step,
    email,
    handleSendCode,
    handleVerifyCode,
    handleResetPassword,
    resetToEmail,
  } = useForgotPasswordViewModel();

  const [emailInput, setEmailInput] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const inputs = useRef<TextInput[]>([]);

  const handleChange = (val: string, index: number) => {
    if (!/^\d*$/.test(val)) return;
    const newCode = [...code];
    newCode[index] = val;
    setCode(newCode);
    if (val && index < 5) inputs.current[index + 1]?.focus();
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  if (success) {
    setTimeout(() => onResetSuccess(), 1500);
  }

  const STEPS = ['email', 'code', 'password'];
  const currentStepIndex = STEPS.indexOf(step);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.inner}
        keyboardShouldPersistTaps="always"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.stepRow}>
          {STEPS.map((s, i) => (
            <View key={s} style={styles.stepWrap}>
              <View style={[
                styles.stepDot,
                i <= currentStepIndex ? styles.stepDotActive : styles.stepDotInactive
              ]}>
                {i < currentStepIndex ? (
                  <Ionicons name="checkmark" size={12} color="#fff" />
                ) : (
                  <Text style={styles.stepNum}>{i + 1}</Text>
                )}
              </View>
              {i < STEPS.length - 1 && (
                <View style={[
                  styles.stepLine,
                  i < currentStepIndex ? styles.stepLineActive : styles.stepLineInactive
                ]} />
              )}
            </View>
          ))}
        </View>

        <View style={styles.iconContainer}>
          <Ionicons
            name={
              step === 'email' ? 'mail-outline' :
              step === 'code' ? 'keypad-outline' :
              'lock-open-outline'
            }
            size={40}
            color="#5A8A5A"
          />
        </View>

        <Text style={styles.title}>
          {step === 'email' ? 'Forgot Password' :
           step === 'code' ? 'Enter Code' :
           'New Password'}
        </Text>

        <Text style={styles.subtitle}>
          {step === 'email' && 'Enter your email and we will send you a reset code.'}
          {step === 'code' && `We sent a 6-digit code to\n`}
          {step === 'code' && <Text style={styles.emailText}>{email}</Text>}
          {step === 'password' && 'Create a new password for your account.'}
        </Text>

        {step === 'email' && (
          <>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={18} color="#888" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email address"
                placeholderTextColor="#999"
                value={emailInput}
                onChangeText={setEmailInput}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={() => handleSendCode(emailInput)}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : (
                  <View style={styles.btnInner}>
                    <Text style={styles.buttonText}>Send Reset Code</Text>
                    <Ionicons name="arrow-forward" size={18} color="#fff" />
                  </View>
                )
              }
            </TouchableOpacity>
          </>
        )}

        {step === 'code' && (
          <>
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
            <TouchableOpacity
              style={[styles.button, (code.join('').length < 6 || loading) && styles.buttonDisabled]}
              onPress={() => handleVerifyCode(code.join(''))}
              disabled={code.join('').length < 6 || loading}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : (
                  <View style={styles.btnInner}>
                    <Text style={styles.buttonText}>Verify Code</Text>
                    <Ionicons name="arrow-forward" size={18} color="#fff" />
                  </View>
                )
              }
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.resendBtn}
              onPress={() => handleSendCode(email)}
            >
              <Text style={styles.resendText}>
                Didn't receive it? <Text style={styles.resendLink}>Resend</Text>
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.changeEmailBtn}
              onPress={() => {
                setCode(['', '', '', '', '', '']);
                resetToEmail();
              }}
            >
              <Text style={styles.changeEmailText}>
                Wrong email? <Text style={styles.changeEmailLink}>Change it</Text>
              </Text>
            </TouchableOpacity>
          </>
        )}

        {step === 'password' && (
          <>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={18} color="#888" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="New password"
                placeholderTextColor="#999"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={18}
                  color="#888"
                />
              </TouchableOpacity>
            </View>

            <View style={[styles.inputWrapper, { marginTop: 12 }]}>
              <Ionicons name="lock-closed-outline" size={18} color="#888" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Confirm new password"
                placeholderTextColor="#999"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirm}
              />
              <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
                <Ionicons
                  name={showConfirm ? 'eye-outline' : 'eye-off-outline'}
                  size={18}
                  color="#888"
                />
              </TouchableOpacity>
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            {success ? <Text style={styles.successText}>Password reset! Redirecting...</Text> : null}

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={() => handleResetPassword(newPassword, confirmPassword)}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : (
                  <View style={styles.btnInner}>
                    <Text style={styles.buttonText}>Reset Password</Text>
                    <Ionicons name="checkmark" size={18} color="#fff" />
                  </View>
                )
              }
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity onPress={onNavigateToLogin} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={16} color="#999" />
          <Text style={styles.loginText}>Back to Login</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  inner: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40, alignItems: 'center' },
  stepRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 32 },
  stepWrap: { flexDirection: 'row', alignItems: 'center' },
  stepDot: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  stepDotActive: { backgroundColor: '#7DBF7A' },
  stepDotInactive: { backgroundColor: '#E0E0E0' },
  stepNum: { fontSize: 12, fontWeight: '700', color: '#fff' },
  stepLine: { width: 40, height: 2, marginHorizontal: 4 },
  stepLineActive: { backgroundColor: '#7DBF7A' },
  stepLineInactive: { backgroundColor: '#E0E0E0' },
  iconContainer: { width: 72, height: 72, backgroundColor: '#E8F5E9', borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 24, fontWeight: '700', color: '#1A1A1A', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#555', textAlign: 'center', marginBottom: 32, lineHeight: 22 },
  emailText: { fontWeight: '700', color: '#1A1A1A' },
  inputWrapper: { width: '100%', flexDirection: 'row', alignItems: 'center', backgroundColor: '#F2F2F2', borderRadius: 12, paddingHorizontal: 14, height: 52, borderWidth: 1, borderColor: 'transparent', marginBottom: 16 },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, color: '#1A1A1A', fontSize: 15 },
  codeContainer: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  codeInput: { width: 48, height: 56, backgroundColor: '#F2F2F2', borderRadius: 10, fontSize: 22, fontWeight: '700', color: '#1A1A1A', borderWidth: 1, borderColor: 'transparent' },
  codeInputFilled: { borderColor: '#7DBF7A', backgroundColor: '#F0FAF0' },
  button: { backgroundColor: '#7DBF7A', borderRadius: 12, height: 52, width: '100%', justifyContent: 'center', alignItems: 'center', marginTop: 8, marginBottom: 16 },
  buttonDisabled: { opacity: 0.5 },
  btnInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  errorText: { color: '#E53935', fontSize: 13, marginBottom: 12, alignSelf: 'flex-start' },
  successText: { color: '#1A6B3A', fontSize: 13, marginBottom: 12 },
  resendBtn: { marginBottom: 8 },
  resendText: { color: '#555', fontSize: 13 },
  resendLink: { color: '#7DBF7A', fontWeight: '700' },
  changeEmailBtn: { marginTop: 4 },
  changeEmailText: { color: '#555', fontSize: 13 },
  changeEmailLink: { color: '#7DBF7A', fontWeight: '700' },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  loginText: { color: '#999', fontSize: 13 },
});