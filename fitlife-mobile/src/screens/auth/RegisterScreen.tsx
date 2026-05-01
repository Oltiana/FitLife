import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView,
  Platform, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRegisterViewModel } from '../../viewmodels/useRegisterViewModel';

export default function RegisterScreen({
  onRegisterSuccess,
  onNavigateToLogin,
}: {
  onRegisterSuccess: () => void;
  onNavigateToLogin: () => void;
}) {
  const {
    firstName, setFirstName,
    lastName, setLastName,
    email, setEmail,
    password, setPassword,
    confirmPassword, setConfirmPassword,
    loading, errors,
    showPassword, setShowPassword,
    showConfirmPassword, setShowConfirmPassword,
    handleRegister,
  } = useRegisterViewModel(onRegisterSuccess);

  const [firstNameFocused, setFirstNameFocused] = useState(false);
  const [lastNameFocused, setLastNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">

        <View style={styles.iconContainer}>
          <Ionicons name="cube-outline" size={40} color="#5A8A5A" />
        </View>

        <Text style={styles.appName}>FitLife</Text>
        <Text style={styles.title}>Create account</Text>

        {errors.general ? <Text style={styles.errorText}>{errors.general}</Text> : null}

        <View style={styles.row}>
          <View style={styles.halfField}>
            <Text style={styles.label}>First Name</Text>
            <TextInput
              style={[styles.inputSimple, errors.firstName ? styles.inputError : firstNameFocused ? styles.inputFocused : null, Platform.OS === 'web' && { outlineStyle: 'none' } as any]}
              placeholder="First Name"
              placeholderTextColor="#999"
              value={firstName}
              onChangeText={setFirstName}
              onFocus={() => setFirstNameFocused(true)}
              onBlur={() => setFirstNameFocused(false)}
            />
            {errors.firstName ? <Text style={styles.fieldError}>{errors.firstName}</Text> : null}
          </View>

          <View style={styles.halfField}>
            <Text style={styles.label}>Last Name</Text>
            <TextInput
              style={[styles.inputSimple, errors.lastName ? styles.inputError : lastNameFocused ? styles.inputFocused : null, Platform.OS === 'web' && { outlineStyle: 'none' } as any]}
              placeholder="Last Name"
              placeholderTextColor="#999"
              value={lastName}
              onChangeText={setLastName}
              onFocus={() => setLastNameFocused(true)}
              onBlur={() => setLastNameFocused(false)}
            />
            {errors.lastName ? <Text style={styles.fieldError}>{errors.lastName}</Text> : null}
          </View>
        </View>

        <Text style={styles.label}>Email</Text>
        <View style={[styles.inputWrapper, errors.email ? styles.inputError : emailFocused ? styles.inputFocused : null]}>
          <Ionicons name="mail-outline" size={18} color="#888" style={styles.inputIcon} />
          <TextInput
            style={[styles.input, Platform.OS === 'web' && { outlineStyle: 'none' } as any]}
            placeholder="Enter your email"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            onFocus={() => setEmailFocused(true)}
            onBlur={() => setEmailFocused(false)}
          />
        </View>
        {errors.email ? <Text style={styles.fieldError}>{errors.email}</Text> : null}

        <Text style={styles.label}>Password</Text>
        <View style={[styles.inputWrapper, errors.password ? styles.inputError : passwordFocused ? styles.inputFocused : null]}>
          <Ionicons name="lock-closed-outline" size={18} color="#888" style={styles.inputIcon} />
          <TextInput
            style={[styles.input, Platform.OS === 'web' && { outlineStyle: 'none' } as any]}
            placeholder="Enter your password"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            onFocus={() => setPasswordFocused(true)}
            onBlur={() => setPasswordFocused(false)}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={18} color="#888" />
          </TouchableOpacity>
        </View>
        {errors.password ? <Text style={styles.fieldError}>{errors.password}</Text> : null}

        <Text style={styles.label}>Confirm Password</Text>
        <View style={[styles.inputWrapper, errors.confirmPassword ? styles.inputError : confirmPasswordFocused ? styles.inputFocused : null]}>
          <Ionicons name="lock-closed-outline" size={18} color="#888" style={styles.inputIcon} />
          <TextInput
            style={[styles.input, Platform.OS === 'web' && { outlineStyle: 'none' } as any]}
            placeholder="Confirm password"
            placeholderTextColor="#999"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            onFocus={() => setConfirmPasswordFocused(true)}
            onBlur={() => setConfirmPasswordFocused(false)}
          />
          <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
            <Ionicons name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'} size={18} color="#888" />
          </TouchableOpacity>
        </View>
        {errors.confirmPassword ? <Text style={styles.fieldError}>{errors.confirmPassword}</Text> : null}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.buttonText}>Create account</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity onPress={onNavigateToLogin}>
          <Text style={styles.loginText}>
            Already have an account?{' '}
            <Text style={styles.loginLink}>Sign In</Text>
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  inner: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40 },

  iconContainer: {
    width: 72, height: 72,
    backgroundColor: '#E8F5E9',
    borderRadius: 16,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },

  appName: { fontSize: 24, fontWeight: '700', textAlign: 'center', color: '#1A1A1A' },
  title: { fontSize: 16, textAlign: 'center', color: '#555', marginBottom: 24, marginTop: 4 },

  row: { flexDirection: 'row', gap: 12, marginBottom: 4 },
  halfField: { flex: 1 },

  label: { fontSize: 13, fontWeight: '600', color: '#5A8A5A', marginBottom: 6, marginTop: 12 },

  inputSimple: {
    backgroundColor: '#F2F2F2',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 50,
    color: '#1A1A1A',
    fontSize: 14,
    borderWidth: 1,
    borderColor: 'transparent',
  },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F2',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 50,
    borderWidth: 1,
    borderColor: 'transparent',
  },

  inputFocused: {
    borderColor: '#7DBF7A',
    borderWidth: 1,
  },

  inputError: {
    borderColor: '#E53935',
    borderWidth: 1,
  },

  inputIcon: { marginRight: 8 },
  input: { flex: 1, color: '#1A1A1A', fontSize: 14 },

  button: {
    backgroundColor: '#7DBF7A',
    borderRadius: 12,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 28,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  errorText: { color: '#E53935', fontSize: 13, textAlign: 'center', marginBottom: 8 },
  fieldError: { color: '#E53935', fontSize: 11, marginTop: 4 },

  loginText: { textAlign: 'center', color: '#555', marginTop: 20, fontSize: 13 },
  loginLink: { color: '#7DBF7A', fontWeight: '700' },
});