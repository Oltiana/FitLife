import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { tokenStorage } from '../../../storage/tokenStorage';
import { useTheme } from '../../../theme/PilatesThemeContext';
import { apiClient } from '../../../api/apiClient';
import { Modal, TextInput } from 'react-native';

export function FitLifeProfileScreen({
  onLogout,
}: {
  onLogout: () => void;
}) {
  const { colors } = useTheme();

const [pilatesCount, setPilatesCount] = useState(0);
const [workoutsCount, setWorkoutsCount] = useState(0);
const [favoritesCount, setFavoritesCount] = useState(0);
const [showEditProfile, setShowEditProfile] = useState(false);
const [showChangePassword, setShowChangePassword] = useState(false);

const [fullName, setFullName] = useState('User');
const [email, setEmail] = useState('');

const [editName, setEditName] = useState(fullName);
const [editEmail, setEditEmail] = useState(email);

const [currentPassword, setCurrentPassword] = useState('');
const [newPassword, setNewPassword] = useState('');

const [enrollments, setEnrollments] = useState<string[]>([]);
const [favorites, setFavorites] = useState<string[]>([]);

  const refreshUser = useCallback(async () => {
    try {
      const user = await tokenStorage.getUser();

      if (user && typeof user === 'object') {
        const name =
          typeof (user as { fullName?: string }).fullName === 'string'
            ? (user as { fullName: string }).fullName
            : 'User';

        const userEmail =
          typeof (user as { email?: string }).email === 'string'
            ? (user as { email: string }).email
            : '';

        setFullName(name);
        setEmail(userEmail);
      }
    } catch (err) {
      console.log(err);
    }
  }, []);

  const loadProfileData = useCallback(async () => {
  try {
    const enrollmentsRes = await apiClient.get<any[]>('/Pilates/my-enrollments');
    const workoutsRes = await apiClient.get<any[]>('/Pilates/my-workout-progress');
    const favoritesRes = await apiClient.get<any[]>('/Fitness/favorites');

    const enrollmentsData = enrollmentsRes.data ?? [];
    const workoutsData = workoutsRes.data ?? [];
    const favoritesData = favoritesRes.data ?? [];

    setPilatesCount(enrollmentsData.length);
    setWorkoutsCount(workoutsData.length);
    setFavoritesCount(favoritesData.length);

    setEnrollments(enrollmentsData.map((x: any) => x.programName));
    setFavorites(favoritesData.map((x: any) => x.exerciseName));

  } catch (err) {
    console.log(err);
  }
}, []);

  useFocusEffect(
  useCallback(() => {
    void refreshUser();
    void loadProfileData();
  }, [refreshUser, loadProfileData]),
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

  const openEditProfile = () => {
  setEditName(fullName);
  setEditEmail(email);
  setShowEditProfile(true);
};

  return (
    <SafeAreaView
      style={[
        styles.screen,
        { backgroundColor: colors.background },
      ]}
      edges={['top']}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profileHeader}>
          <View
            style={[
              styles.avatar,
              { backgroundColor: colors.primary },
            ]}
          >
            <Text style={styles.avatarText}>
              {fullName.charAt(0).toUpperCase()}
            </Text>
          </View>

          <Text
            style={[
              styles.name,
              { color: colors.text },
            ]}
          >
            {fullName}
          </Text>

          <Text
            style={[
              styles.email,
              { color: colors.textSecondary },
            ]}
          >
            {email}
          </Text>

          <Text
            style={[
              styles.memberSince,
              { color: colors.textSecondary },
            ]}
          >
            Member since 2026
          </Text>
        </View>

        <Text
          style={[
            styles.sectionTitle,
            { color: colors.text },
          ]}
        >
          📊 My Activity
        </Text>

  <View style={styles.activityRow}>
  <View
    style={[
      styles.activityCard,
      {
        backgroundColor: colors.surface,
        borderColor: colors.border,
      },
    ]}>
    <Text style={styles.activityNumber}>{workoutsCount}</Text>
    <Text style={{ color: colors.text }}>🏋️ Workouts</Text>
  </View>

  <View
    style={[
      styles.activityCard,
      {
        backgroundColor: colors.surface,
        borderColor: colors.border,
      },
    ]}>
    <Text style={styles.activityNumber}>{pilatesCount}</Text>
    <Text style={{ color: colors.text }}>🤸 Pilates</Text>
  </View>

  <View
    style={[
      styles.activityCard,
      {
        backgroundColor: colors.surface,
        borderColor: colors.border,
      },
    ]}>
    <Text style={styles.activityNumber}>{favoritesCount}</Text>
    <Text style={{ color: colors.text }}>❤️ Favorites</Text>
  </View>
</View>

        <View
          style={[
            styles.section,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <Text
            style={[
              styles.sectionTitle,
              { color: colors.text },
            ]}
          >
            🤸 My Pilates Programs
          </Text>

          {enrollments.map((item, index) => (
            <Text
              key={index}
              style={[
                styles.listItem,
                { color: colors.text },
              ]}
            >
              • {item}
            </Text>
          ))}
        </View>

        <View
          style={[
            styles.section,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <Text
            style={[
              styles.sectionTitle,
              { color: colors.text },
            ]}
          >
            ❤️ Favorite Exercises
          </Text>

          {favorites.map((item, index) => (
            <Text
              key={index}
              style={[
                styles.listItem,
                { color: colors.text },
              ]}
            >
              • {item}
            </Text>
          ))}

          
        </View>

        <View
          style={[
            styles.section,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <Text
            style={[
              styles.sectionTitle,
              { color: colors.text },
            ]}
          >
            ⚙️ Settings
          </Text>

          <Pressable onPress={openEditProfile}>
  <Text style={styles.settingItem}>✏️ Edit Profile</Text>
</Pressable>

<Pressable
  onPress={() => setShowChangePassword(true)}
>
  <Text style={[styles.settingItem, { color: colors.text }]}>
    🔒 Change Password
  </Text>
</Pressable>

          <Pressable
            style={[
              styles.logoutButton,
              { backgroundColor: colors.primary },
            ]}
            onPress={() => void handleLogout()}
          >
            <Text style={styles.logoutText}>
              Logout
            </Text>
          </Pressable>
        </View>
      </ScrollView>
     <Modal visible={showEditProfile} transparent animationType="slide">
  <View style={styles.modalOverlay}>
    <View style={[styles.modalBox, { backgroundColor: colors.surface }]}>
      
      <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 10 }}>
        Edit Profile
      </Text>

      <TextInput
        value={editName}
        onChangeText={setEditName}
        placeholder="Full name"
        style={styles.input}
      />

      <TextInput
        value={editEmail}
        onChangeText={setEditEmail}
        placeholder="Email"
        style={styles.input}
      />

      <Pressable
        onPress={() => {
          setFullName(editName);
          setEmail(editEmail);
          setShowEditProfile(false);
        }}
        style={styles.modalButton}
      >
        <Text style={{ color: '#fff' }}>Save Changes</Text>
      </Pressable>

      <Pressable
        onPress={() => setShowEditProfile(false)}
        style={[styles.modalButton, { backgroundColor: '#999' }]}
      >
        <Text style={{ color: '#fff' }}>Cancel</Text>
      </Pressable>

    </View>
  </View>
</Modal>

<Modal visible={showChangePassword} transparent animationType="slide">
  <View style={styles.modalOverlay}>
    <View style={[styles.modalBox, { backgroundColor: colors.surface }]}>
      
      <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 10 }}>
        Change Password
      </Text>

      <TextInput
        value={currentPassword}
        onChangeText={setCurrentPassword}
        placeholder="Current password"
        secureTextEntry
        style={styles.input}
      />

      <TextInput
        value={newPassword}
        onChangeText={setNewPassword}
        placeholder="New password"
        secureTextEntry
        style={styles.input}
      />

      <Pressable
        onPress={() => {
          console.log('Change password:', {
            currentPassword,
            newPassword,
          });

          setCurrentPassword('');
          setNewPassword('');
          setShowChangePassword(false);
        }}
        style={styles.modalButton}
      >
        <Text style={{ color: '#fff' }}>Update Password</Text>
      </Pressable>

      <Pressable
        onPress={() => setShowChangePassword(false)}
        style={[styles.modalButton, { backgroundColor: '#999' }]}
      >
        <Text style={{ color: '#fff' }}>Cancel</Text>
      </Pressable>

    </View>
  </View>
</Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  profileHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },

  avatarText: {
    color: '#fff',
    fontSize: 34,
    fontWeight: '800',
  },

  name: {
    fontSize: 24,
    fontWeight: '800',
  },

  email: {
    marginTop: 4,
    fontSize: 14,
  },

  memberSince: {
    marginTop: 8,
    fontSize: 13,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },

  activityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },

  activityCard: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
  },

  activityNumber: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 6,
  },

  section: {
    padding: 18,
    borderRadius: 18,
    marginBottom: 18,
    borderWidth: 1,
  },

  listItem: {
    fontSize: 15,
    marginBottom: 10,
  },

  settingItem: {
    fontSize: 15,
    marginBottom: 14,
  },

  logoutButton: {
    marginTop: 10,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },

  logoutText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.5)',
  justifyContent: 'center',
  alignItems: 'center',
},

modalBox: {
  width: '85%',
  padding: 20,
  borderRadius: 16,
},

modalButton: {
  marginTop: 15,
  backgroundColor: '#e91e63',
  padding: 10,
  borderRadius: 10,
  alignItems: 'center',
},
});

