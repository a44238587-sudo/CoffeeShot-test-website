import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme';

type PermissionGateProps = {
  title: string;
  message: string;
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
};

export function PermissionGate({
  title,
  message,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
}: PermissionGateProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.mark}>CoffeeShot</Text>
      <View style={styles.orb}>
        <View style={styles.orbInner} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      <Pressable accessibilityRole="button" onPress={onPrimary} style={styles.primary}>
        <Text style={styles.primaryLabel}>{primaryLabel}</Text>
      </Pressable>
      {secondaryLabel && onSecondary ? (
        <Pressable accessibilityRole="button" onPress={onSecondary} style={styles.secondary}>
          <Text style={styles.secondaryLabel}>{secondaryLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  mark: {
    position: 'absolute',
    top: 36,
    color: colors.creamMuted,
    letterSpacing: 3,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  orb: {
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 2,
    borderColor: colors.amber,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  orbInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.amberSoft,
    borderWidth: 2,
    borderColor: colors.cream,
  },
  title: {
    color: colors.cream,
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
  },
  message: {
    color: colors.creamMuted,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    maxWidth: 420,
    marginBottom: 28,
  },
  primary: {
    backgroundColor: colors.amber,
    borderRadius: 999,
    paddingHorizontal: 22,
    paddingVertical: 13,
    minWidth: 220,
    alignItems: 'center',
  },
  primaryLabel: {
    color: colors.bg,
    fontWeight: '700',
    fontSize: 15,
  },
  secondary: {
    marginTop: 14,
    padding: 8,
  },
  secondaryLabel: {
    color: colors.creamMuted,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
