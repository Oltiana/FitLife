import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  onOpenPilates: () => void;
};

export function WelcomeScreen({ onOpenPilates }: Props) {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Welcome to FitLife</Text>
      <Text style={styles.subtitle}>
        Start your Pilates journey, track progress, and stay consistent.
      </Text>

      <Pressable
        style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
        onPress={onOpenPilates}
      >
        <Text style={styles.ctaText}>Open Pilates</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f6fbf8',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#1b4332',
    letterSpacing: -0.8,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 12,
    fontSize: 16,
    lineHeight: 24,
    color: '#38584a',
    textAlign: 'center',
    maxWidth: 620,
  },
  cta: {
    marginTop: 28,
    backgroundColor: '#2d6a4f',
    paddingVertical: 14,
    paddingHorizontal: 26,
    borderRadius: 12,
  },
  ctaPressed: {
    opacity: 0.9,
  },
  ctaText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
