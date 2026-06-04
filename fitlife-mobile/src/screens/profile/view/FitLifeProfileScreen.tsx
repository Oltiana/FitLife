import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { tokenStorage } from '../../../storage/tokenStorage';
import { useTheme } from '../../../theme/PilatesThemeContext';

export function FitLifeProfileScreen({ onLogout }: { onLogout: () => void }) {
  const { colors } = useTheme();
  const [subtitle, setSubtitle] = useState<string>('Guest / device profile');

  const refreshUser = useCallback(async () => {
    try {
      const u = await tokenStorage.getUser();
      if (u && typeof u === 'object') {
        const name =
          typeof (u as { fullName?: string }).fullName === 'string'
            ? (u as { fullName: string }).fullName.trim()
            : '';
        const email =
          typeof (u as { email?: string }).email === 'string'
            ? (u as { email: string }).email.trim()
            : '';
        setSubtitle(name || email || 'Signed in');
        return;
      }
    } catch {
    }
    setSubtitle('Guest — FitLife data on this device uses an anonymous id until you sign in');
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refreshUser();
    }, [refreshUser]),
  );

  const handleLogout = async () => {
    try {
      await tokenStorage.clearAuth();
    } catch (e) {
      console.warn('Logout error:', e);
    } finally {
      onLogout();
    }
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>Profile</Text>
        <Text style={[styles.sub, { color: colors.textSecondary }]}>{subtitle}</Text>

        <Pressable
          style={({ pressed }) => [
            styles.logout,
            { backgroundColor: colors.primary, opacity: pressed ? 0.9 : 1 },
          ]}
          onPress={() => void handleLogout()}
        >
          <Text style={styles.logoutText}>Log out</Text>
        </Pressable>

        <Text style={[styles.hint, { color: colors.textSecondary }]}>
          Logging out clears saved login tokens. Guest Pilates history stays tied to this phone until
          you clear app data.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 22, paddingBottom: 40 },
  title: { fontSize: 26, fontWeight: '800', marginBottom: 8 },
  sub: { fontSize: 15, lineHeight: 22, marginBottom: 28 },
  logout: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  logoutText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  hint: { fontSize: 13, lineHeight: 19 },
});