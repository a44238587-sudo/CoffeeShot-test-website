import { CameraView, useCameraPermissions, type CameraType } from 'expo-camera';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FramingOverlay } from '../components/FramingOverlay';
import { PermissionGate } from '../components/PermissionGate';
import { ResultPanel } from '../components/ResultPanel';
import { hasRemoteApi } from '../config';
import { analyzePhoto } from '../services/analyzePhoto';
import { createDemoCapture } from '../services/picture';
import { colors } from '../theme';
import type { AnalyzeResult, UploadStatus } from '../types';

const AI_HINTS = [
  'Centrez le sujet',
  'Alignez sur la grille des tiers',
  'Gardez un peu d’espace au-dessus',
  'Lumière plus douce sur la gauche',
  'Parfait — restez stable',
];

export function CameraScreen() {
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [cameraReady, setCameraReady] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [busy, setBusy] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);
  const [banner, setBanner] = useState<string | undefined>(
    hasRemoteApi ? undefined : 'Mode mock — aucune API configurée',
  );
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setHintIndex((index) => (index + 1) % AI_HINTS.length);
    }, 3200);
    return () => clearInterval(timer);
  }, []);

  const runAnalysis = useCallback(async (uri: string) => {
    setStatus('uploading');
    setProgress(0);
    setResult(null);
    setError(null);
    try {
      const analysis = await analyzePhoto(uri, setProgress);
      setResult(analysis);
      setStatus('success');
      setProgress(100);
    } catch (caught) {
      setStatus('error');
      setError(caught instanceof Error ? caught.message : 'Analyse impossible');
    }
  }, []);

  const capture = useCallback(async () => {
    if (busy) {
      return;
    }

    setBusy(true);
    try {
      let uri: string | undefined;

      if (demoMode) {
        uri = await createDemoCapture();
      } else {
        if (!cameraReady) {
          return;
        }
        const photo = await cameraRef.current?.takePictureAsync({
          quality: 0.85,
          skipProcessing: true,
        });
        uri = photo?.uri;
      }

      if (!uri) {
        throw new Error('Aucune image capturée');
      }

      setCapturedUri(uri);
      await runAnalysis(uri);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : 'Capture impossible';
      setBanner(message);
      setError(message);
      setStatus('error');
    } finally {
      setBusy(false);
    }
  }, [busy, cameraReady, demoMode, runAnalysis]);

  const enterDemo = useCallback((reason?: string) => {
    setDemoMode(true);
    setCameraReady(true);
    setBanner(reason ?? 'Mode démo — caméra simulée');
  }, []);

  const toggleFacing = useCallback(() => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
    setCameraReady(false);
  }, []);

  const retake = useCallback(() => {
    setCapturedUri(null);
    setStatus('idle');
    setProgress(0);
    setResult(null);
    setError(null);
  }, []);

  if (!permission && !demoMode) {
    return <View style={styles.fill} />;
  }

  if (!demoMode && permission && !permission.granted) {
    return (
      <PermissionGate
        title="La caméra est requise"
        message="CoffeeShot affiche un cadrage temps réel. Autorisez la caméra, ou continuez en mode démo si le navigateur n’a pas de webcam."
        primaryLabel="Autoriser la caméra"
        onPrimary={() => {
          void requestPermission();
        }}
        secondaryLabel="Continuer en mode démo"
        onSecondary={() => enterDemo()}
      />
    );
  }

  if (capturedUri) {
    return (
      <ResultPanel
        uri={capturedUri}
        status={status}
        progress={progress}
        result={result}
        error={error}
        onRetake={retake}
        onRetry={() => {
          void runAnalysis(capturedUri);
        }}
      />
    );
  }

  return (
    <View style={styles.fill}>
      {demoMode ? (
        <View style={styles.demoStage}>
          <View style={styles.demoGlow} />
          <Text style={styles.demoMark}>Aperçu démo</Text>
        </View>
      ) : (
        <CameraView
          ref={cameraRef}
          style={styles.fill}
          facing={facing}
          mode="picture"
          mirror={facing === 'front'}
          onCameraReady={() => setCameraReady(true)}
          onMountError={(event) => {
            enterDemo(`Caméra indisponible — ${event.message || 'mode démo'}`);
          }}
        />
      )}

      <FramingOverlay hint={AI_HINTS[hintIndex]} banner={banner} />

      <View style={styles.topBar}>
        <Text style={styles.brand}>CoffeeShot</Text>
        <Text style={styles.mode}>{demoMode ? 'Démo' : facing === 'front' ? 'Avant' : 'Arrière'}</Text>
      </View>

      <View style={styles.controls}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Retourner la caméra"
          disabled={demoMode}
          onPress={toggleFacing}
          style={[styles.sideButton, demoMode && styles.sideDisabled]}
        >
          <Text style={styles.sideLabel}>Flip</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Prendre la photo"
          disabled={busy || (!demoMode && !cameraReady)}
          onPress={() => {
            void capture();
          }}
          style={[styles.shutter, (busy || (!demoMode && !cameraReady)) && styles.shutterBusy]}
        >
          <View style={styles.shutterInner} />
        </Pressable>

        <View style={styles.sideButton}>
          <Text style={styles.sideLabel}>{busy ? '…' : 'JPG'}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  demoStage: {
    flex: 1,
    backgroundColor: '#20140E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  demoGlow: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(232, 165, 75, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(243, 230, 212, 0.2)',
  },
  demoMark: {
    marginTop: 18,
    color: colors.creamMuted,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    fontSize: 12,
  },
  topBar: {
    position: 'absolute',
    top: 18,
    left: 18,
    right: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brand: {
    color: colors.cream,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  mode: {
    color: colors.creamMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  controls: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  sideButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 1,
    borderColor: colors.creamFaint,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.overlay,
  },
  sideDisabled: {
    opacity: 0.35,
  },
  sideLabel: {
    color: colors.cream,
    fontSize: 12,
    fontWeight: '700',
  },
  shutter: {
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 3,
    borderColor: colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterBusy: {
    opacity: 0.45,
  },
  shutterInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.amber,
  },
});
