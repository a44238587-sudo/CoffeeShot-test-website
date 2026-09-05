import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme';
import type { AnalyzeResult, UploadStatus } from '../types';

type ResultPanelProps = {
  uri: string;
  status: UploadStatus;
  progress: number;
  result: AnalyzeResult | null;
  error: string | null;
  onRetake: () => void;
  onRetry: () => void;
};

function statusLabel(status: UploadStatus, progress: number): string {
  if (status === 'uploading') {
    return `Analyse en cours · ${progress}%`;
  }
  if (status === 'success') {
    return 'Analyse terminée';
  }
  if (status === 'error') {
    return 'Échec de l’envoi';
  }
  return 'Prêt';
}

export function ResultPanel({
  uri,
  status,
  progress,
  result,
  error,
  onRetake,
  onRetry,
}: ResultPanelProps) {
  return (
    <View style={styles.sheet}>
      <Image source={{ uri }} style={styles.preview} resizeMode="cover" />
      <View style={styles.meta}>
        <Text style={styles.kicker}>{result?.source === 'api' ? 'Backend' : 'Mock local'}</Text>
        <Text style={styles.status}>{statusLabel(status, progress)}</Text>
        {status === 'uploading' ? (
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${Math.max(progress, 6)}%` }]} />
          </View>
        ) : null}
        {status === 'uploading' ? <ActivityIndicator color={colors.amber} style={styles.spinner} /> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {result ? (
          <View style={styles.result}>
            <View style={styles.resultHead}>
              <Text style={styles.resultTitle}>{result.title}</Text>
              {typeof result.score === 'number' ? <Text style={styles.score}>{result.score}</Text> : null}
            </View>
            {result.tips.map((tip) => (
              <Text key={tip} style={styles.tip}>
                · {tip}
              </Text>
            ))}
          </View>
        ) : null}
      </View>
      <View style={styles.actions}>
        {status === 'error' ? (
          <Pressable accessibilityRole="button" onPress={onRetry} style={styles.retry}>
            <Text style={styles.retryLabel}>Réessayer</Text>
          </Pressable>
        ) : null}
        <Pressable accessibilityRole="button" onPress={onRetake} style={styles.retake}>
          <Text style={styles.retakeLabel}>Nouvelle photo</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  preview: {
    width: '100%',
    height: 240,
    borderRadius: 18,
    backgroundColor: colors.espresso,
  },
  meta: {
    flex: 1,
    gap: 8,
    paddingTop: 14,
  },
  kicker: {
    color: colors.amber,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  status: {
    color: colors.cream,
    fontSize: 18,
    fontWeight: '600',
  },
  track: {
    height: 6,
    borderRadius: 999,
    backgroundColor: colors.creamFaint,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.amber,
  },
  spinner: {
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  error: {
    color: colors.danger,
    fontSize: 14,
    lineHeight: 20,
  },
  result: {
    backgroundColor: colors.bgElevated,
    borderRadius: 16,
    padding: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.creamFaint,
  },
  resultHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  resultTitle: {
    color: colors.cream,
    fontSize: 17,
    fontWeight: '700',
    flex: 1,
  },
  score: {
    color: colors.success,
    fontSize: 22,
    fontWeight: '700',
  },
  tip: {
    color: colors.creamMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    gap: 10,
    paddingTop: 12,
  },
  retry: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.creamFaint,
    paddingVertical: 12,
    alignItems: 'center',
  },
  retryLabel: {
    color: colors.cream,
    fontWeight: '600',
  },
  retake: {
    backgroundColor: colors.amber,
    borderRadius: 999,
    paddingVertical: 13,
    alignItems: 'center',
  },
  retakeLabel: {
    color: colors.bg,
    fontWeight: '700',
    fontSize: 15,
  },
});
