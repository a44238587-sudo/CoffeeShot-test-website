import { useCallback } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { FramingOverlay } from '../components/FramingOverlay';
import { PermissionGate } from '../components/PermissionGate';
import { ResultPanel } from '../components/ResultPanel';
import { SdkPreview } from '../components/SdkPreview';
import { sdkOrigin } from '../config';
import { useCoffeeShotSession } from '../sdk/useCoffeeShotSession';
import { colors } from '../theme';

function compatibilityMessage(reason?: string): string {
  if (reason === 'insecure_context') {
    return 'La caméra nécessite HTTPS ou localhost. Continuez en mode démo, ou rouvrez la page dans un contexte sécurisé.';
  }
  if (reason === 'no_media_devices') {
    return 'Aucune caméra n’est disponible dans ce navigateur. Continuez en mode démo pour tester le cadrage et l’analyse.';
  }
  return 'Le SDK CoffeeShot n’a pas trouvé de caméra utilisable. Continuez en mode démo pour tester la page.';
}

export function CameraScreen() {
  const session = useCoffeeShotSession();

  const onPreviewReady = useCallback(
    (video: HTMLVideoElement) => {
      session.attachPreview(video);
    },
    [session.attachPreview],
  );

  if (Platform.OS !== 'web') {
    return (
      <PermissionGate
        title="Disponible sur le web"
        message="Cette page de test pilote le CoffeeShot browser SDK. Ouvrez-la dans un navigateur pour la caméra, le flip et l’analyse."
        primaryLabel="Compris"
        onPrimary={() => undefined}
      />
    );
  }

  if (!session.sdk && !session.sdkError) {
    return (
      <View style={styles.boot}>
        <Text style={styles.bootMark}>CoffeeShot</Text>
        <Text style={styles.bootTitle}>Chargement du SDK…</Text>
        <Text style={styles.bootCopy}>{sdkOrigin}/sdk.mjs</Text>
      </View>
    );
  }

  if (session.sdkError) {
    return (
      <PermissionGate
        title="SDK indisponible"
        message={`${session.sdkError} Vérifiez EXPO_PUBLIC_SDK_ORIGIN (${sdkOrigin}).`}
        primaryLabel="Réessayer"
        onPrimary={session.reloadSdk}
      />
    );
  }

  if (!session.intent) {
    const supported = session.compatibility?.supported ?? false;
    return (
      <PermissionGate
        title={supported ? 'La caméra est requise' : 'Caméra indisponible'}
        message={
          session.error ??
          (supported
            ? 'CoffeeShot affiche un cadrage temps réel via le browser SDK. Autorisez la caméra, ou continuez en mode démo.'
            : compatibilityMessage(session.compatibility?.reason))
        }
        primaryLabel={supported ? 'Autoriser la caméra' : 'Continuer en mode démo'}
        onPrimary={() => session.start(supported ? 'live' : 'demo')}
        secondaryLabel={supported ? 'Continuer en mode démo' : undefined}
        onSecondary={supported ? () => session.start('demo') : undefined}
      />
    );
  }

  const flipping = session.clientState === 'flipping';
  const starting = session.clientState === 'starting';
  const commandBusy =
    starting ||
    flipping ||
    session.clientState === 'capturing' ||
    session.clientState === 'analyzing';
  const previewing = session.clientState === 'previewing';
  const flipDisabled = session.demo || commandBusy || !previewing;
  const shutterDisabled = commandBusy || (!session.demo && !previewing);

  return (
    <View style={styles.fill}>
      {session.demo ? (
        <View style={styles.demoStage}>
          <View style={styles.demoGlow} />
          <Text style={styles.demoMark}>Aperçu démo</Text>
        </View>
      ) : (
        <SdkPreview onReady={onPreviewReady} />
      )}

      {session.capturedUri ? (
        <View style={styles.resultLayer}>
          <ResultPanel
            uri={session.capturedUri}
            status={session.uploadStatus}
            progress={session.progress}
            result={session.result}
            error={session.error}
            onRetake={session.retake}
            onRetry={session.retry}
          />
        </View>
      ) : (
        <>
          <FramingOverlay hint={session.hint} banner={session.banner} />

          {!session.demo && (flipping || starting || !previewing) ? (
            <View style={styles.switchingOverlay}>
              <Text style={styles.switchingText}>
                {flipping ? 'Changement de caméra…' : 'Ouverture de la caméra…'}
              </Text>
            </View>
          ) : null}

          <View style={styles.topBar}>
            <Text style={styles.brand}>CoffeeShot</Text>
            <Text style={styles.mode}>
              {session.demo ? 'Démo' : session.facing === 'front' ? 'Avant' : 'Arrière'}
            </Text>
          </View>

          <View style={styles.controls}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Retourner la caméra"
              disabled={flipDisabled}
              onPress={() => {
                void session.flip();
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
                void session.capture();
              }}
              style={[styles.shutter, shutterDisabled && styles.shutterBusy]}
            >
              <View style={styles.shutterInner} />
            </Pressable>

            <View style={styles.sideButton}>
              <Text style={styles.sideLabel}>{commandBusy ? '…' : 'JPG'}</Text>
            </View>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  boot: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  bootMark: {
    color: colors.creamMuted,
    letterSpacing: 3,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  bootTitle: {
    color: colors.cream,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  bootCopy: {
    color: colors.creamMuted,
    fontSize: 13,
  },
  resultLayer: {
    ...StyleSheet.absoluteFill,
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
    pointerEvents: 'none',
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
