import { CameraView, useCameraPermissions, type CameraType } from 'expo-camera';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { FramingOverlay } from '../components/FramingOverlay';
import { PermissionGate } from '../components/PermissionGate';
import { ResultPanel } from '../components/ResultPanel';
import { hasRemoteApi } from '../config';
import { analyzePhoto } from '../services/analyzePhoto';
import { createDemoCapture } from '../services/picture';
import { countWebVideoInputs, stopWebVideoStreams } from '../services/webCamera';
import { colors } from '../theme';
import type { AnalyzeResult, UploadStatus } from '../types';

const AI_HINTS = [
  'Centrez le sujet',
  'Alignez sur la grille des tiers',
  'Gardez un peu d’espace au-dessus',
  'Lumière plus douce sur la gauche',
  'Parfait — restez stable',
];

const MOCK_BANNER = hasRemoteApi ? undefined : 'Mode mock — aucune API configurée';
const READY_TIMEOUT_MS = 8000;
const WEB_STREAM_RELEASE_MS = 80;

type SwitchPhase = 'idle' | 'to-next' | 'revert';

function facingLabel(type: CameraType): string {
  return type === 'front' ? 'avant' : 'arrière';
}

function unavailableBanner(failed: CameraType): string {
  const backTo = failed === 'front' ? 'arrière' : 'avant';
  return `Caméra ${facingLabel(failed)} indisponible — retour à l’${backTo}`;
}

export function CameraScreen() {
  const cameraRef = useRef<CameraView>(null);
  const switchPhaseRef = useRef<SwitchPhase>('idle');
  const previousFacingRef = useRef<CameraType>('back');
  const facingRef = useRef<CameraType>('back');
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [cameraEpoch, setCameraEpoch] = useState(0);
  const [previewHeld, setPreviewHeld] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [busy, setBusy] = useState(false);
  const [hintIndex, setHintIndex] = useState(0);
  const [banner, setBanner] = useState<string | undefined>(MOCK_BANNER);
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  facingRef.current = facing;

  useEffect(() => {
    const timer = setInterval(() => {
      setHintIndex((index) => (index + 1) % AI_HINTS.length);
    }, 3200);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    return () => {
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current);
      }
      stopWebVideoStreams();
    };
  }, []);

  const remountCamera = useCallback((nextFacing: CameraType) => {
    stopWebVideoStreams();
    setCameraReady(false);
    setFacing(nextFacing);

    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }

    if (Platform.OS === 'web') {
      setPreviewHeld(true);
      holdTimerRef.current = setTimeout(() => {
        setPreviewHeld(false);
        setCameraEpoch((value) => value + 1);
        holdTimerRef.current = null;
      }, WEB_STREAM_RELEASE_MS);
      return;
    }

    setCameraEpoch((value) => value + 1);
  }, []);

  const enterDemo = useCallback((reason?: string) => {
    switchPhaseRef.current = 'idle';
    setSwitching(false);
    setPreviewHeld(false);
    setDemoMode(true);
    setCameraReady(true);
    setBanner(reason ?? 'Mode démo — caméra simulée');
  }, []);

  useEffect(() => {
    if (demoMode || cameraReady || previewHeld) {
      return;
    }

    const timer = setTimeout(() => {
      if (switchPhaseRef.current === 'to-next') {
        switchPhaseRef.current = 'revert';
        setBanner(unavailableBanner(facingRef.current));
        remountCamera(previousFacingRef.current);
        return;
      }

      enterDemo('Caméra trop longue à démarrer — mode démo');
    }, READY_TIMEOUT_MS);

    return () => clearTimeout(timer);
  }, [cameraEpoch, cameraReady, demoMode, enterDemo, previewHeld, remountCamera]);

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

  const handleCameraReady = useCallback(() => {
    const phase = switchPhaseRef.current;
    switchPhaseRef.current = 'idle';
    setCameraReady(true);
    setSwitching(false);
    if (phase === 'to-next') {
      setBanner(MOCK_BANNER);
    }
  }, []);

  const handleMountError = useCallback(
    (event: { message: string }) => {
      if (switchPhaseRef.current === 'to-next') {
        switchPhaseRef.current = 'revert';
        setBanner(unavailableBanner(facingRef.current));
        remountCamera(previousFacingRef.current);
        return;
      }

      enterDemo(`Caméra indisponible — ${event.message || 'mode démo'}`);
    },
    [enterDemo, remountCamera],
  );

  const toggleFacing = useCallback(async () => {
    if (demoMode || switching || busy || !cameraReady) {
      return;
    }

    const next: CameraType = facing === 'back' ? 'front' : 'back';
    const videoCount = await countWebVideoInputs();
    if (videoCount !== null && videoCount < 2) {
      setBanner('Une seule caméra est disponible sur cet appareil');
      return;
    }

    previousFacingRef.current = facing;
    switchPhaseRef.current = 'to-next';
    setSwitching(true);
    remountCamera(next);
  }, [busy, cameraReady, demoMode, facing, remountCamera, switching]);

  const retake = useCallback(() => {
    setCapturedUri(null);
    setStatus('idle');
    setProgress(0);
    setResult(null);
    setError(null);
    setCameraReady(false);
    setCameraEpoch((value) => value + 1);
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

  const flipDisabled = demoMode || switching || busy || !cameraReady;
  const shutterDisabled = busy || (!demoMode && !cameraReady);

  return (
    <View style={styles.fill}>
      {demoMode ? (
        <View style={styles.demoStage}>
          <View style={styles.demoGlow} />
          <Text style={styles.demoMark}>Aperçu démo</Text>
        </View>
      ) : previewHeld ? (
        <View style={styles.fill} />
      ) : (
        <CameraView
          key={`cam-${facing}-${cameraEpoch}`}
          ref={cameraRef}
          style={styles.fill}
          facing={facing}
          mode="picture"
          mirror={facing === 'front'}
          onCameraReady={handleCameraReady}
          onMountError={handleMountError}
        />
      )}

      <FramingOverlay hint={AI_HINTS[hintIndex]} banner={banner} />

      {!demoMode && (switching || !cameraReady) ? (
        <View style={styles.switchingOverlay} pointerEvents="none">
          <Text style={styles.switchingText}>
            {switching ? 'Changement de caméra…' : 'Ouverture de la caméra…'}
          </Text>
        </View>
      ) : null}

      <View style={styles.topBar}>
        <Text style={styles.brand}>CoffeeShot</Text>
        <Text style={styles.mode}>{demoMode ? 'Démo' : facing === 'front' ? 'Avant' : 'Arrière'}</Text>
      </View>

      <View style={styles.controls}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Retourner la caméra"
          disabled={flipDisabled}
          onPress={() => {
            void toggleFacing();
          }}
          style={[styles.sideButton, flipDisabled && styles.sideDisabled]}
        >
          <Text style={styles.sideLabel}>Flip</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Prendre la photo"
          disabled={shutterDisabled}
          onPress={() => {
            void capture();
          }}
          style={[styles.shutter, shutterDisabled && styles.shutterBusy]}
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
  switchingOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(8, 6, 5, 0.45)',
  },
  switchingText: {
    color: colors.cream,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.4,
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
