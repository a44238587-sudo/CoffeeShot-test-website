import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme';

type FramingOverlayProps = {
  hint: string;
  banner?: string;
};

export function FramingOverlay({ hint, banner }: FramingOverlayProps) {
  return (
    <View style={[StyleSheet.absoluteFill, styles.ignoreTouch]}>
      <View style={styles.grid}>
        <View style={[styles.vLine, { left: '33.333%' }]} />
        <View style={[styles.vLine, { left: '66.666%' }]} />
        <View style={[styles.hLine, { top: '33.333%' }]} />
        <View style={[styles.hLine, { top: '66.666%' }]} />
        <View style={[styles.bracket, styles.tl]} />
        <View style={[styles.bracket, styles.tr]} />
        <View style={[styles.bracket, styles.bl]} />
        <View style={[styles.bracket, styles.br]} />
      </View>

      <View style={styles.hintWrap}>
        {banner ? (
          <View style={styles.banner}>
            <Text style={styles.bannerText}>{banner}</Text>
          </View>
        ) : null}
        <View style={styles.hintChip}>
          <Text style={styles.hintKicker}>IA · cadrage</Text>
          <Text style={styles.hint}>{hint}</Text>
        </View>
      </View>
    </View>
  );
}

const BRACKET = 22;

const styles = StyleSheet.create({
  ignoreTouch: {
    pointerEvents: 'none',
  },
  grid: {
    ...StyleSheet.absoluteFill,
    marginHorizontal: 18,
    marginTop: 118,
    marginBottom: 168,
  },
  vLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: StyleSheet.hairlineWidth,
    backgroundColor: colors.line,
  },
  hLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.line,
  },
  bracket: {
    position: 'absolute',
    width: BRACKET,
    height: BRACKET,
    borderColor: colors.cream,
  },
  tl: {
    top: 0,
    left: 0,
    borderTopWidth: 2,
    borderLeftWidth: 2,
  },
  tr: {
    top: 0,
    right: 0,
    borderTopWidth: 2,
    borderRightWidth: 2,
  },
  bl: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
  },
  br: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 2,
    borderRightWidth: 2,
  },
  hintWrap: {
    position: 'absolute',
    top: 52,
    left: 16,
    right: 16,
    alignItems: 'center',
    gap: 8,
  },
  banner: {
    backgroundColor: colors.amberSoft,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  bannerText: {
    color: colors.amber,
    fontSize: 12,
    fontWeight: '600',
  },
  hintChip: {
    backgroundColor: colors.overlay,
    borderColor: colors.creamFaint,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxWidth: 420,
    width: '100%',
  },
  hintKicker: {
    color: colors.amber,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  hint: {
    color: colors.cream,
    fontSize: 16,
    fontWeight: '500',
  },
});
