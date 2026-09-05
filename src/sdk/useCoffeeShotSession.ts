import { useCallback, useEffect, useRef, useState } from 'react';

import { analyzePath, apiBaseUrl, sdkOrigin } from '../config';
import type { AnalyzeResult, UploadStatus } from '../types';
import { loadCoffeeShotSdk } from './loadSdk';
import {
  getErrorMessage,
  getSdkErrorCode,
  type ClientState,
  type CoffeeShotClient,
  type CoffeeShotSdk,
  type CompatibilityReport,
  type Facing,
} from './types';

export type SessionIntent = 'live' | 'demo';

type SessionState = {
  sdk: CoffeeShotSdk | null;
  sdkError: string | null;
  compatibility: CompatibilityReport | null;
  intent: SessionIntent | null;
  clientState: ClientState;
  facing: Facing;
  demo: boolean;
  hint: string;
  banner: string | undefined;
  capturedUri: string | null;
  uploadStatus: UploadStatus;
  progress: number;
  result: AnalyzeResult | null;
  error: string | null;
};

const INITIAL: SessionState = {
  sdk: null,
  sdkError: null,
  compatibility: null,
  intent: null,
  clientState: 'idle',
  facing: 'back',
  demo: false,
  hint: 'Centrez le sujet',
  banner: undefined,
  capturedUri: null,
  uploadStatus: 'idle',
  progress: 0,
  result: null,
  error: null,
};

export function useCoffeeShotSession() {
  const clientRef = useRef<CoffeeShotClient | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [loadKey, setLoadKey] = useState(0);
  const [state, setState] = useState<SessionState>(INITIAL);

  useEffect(() => {
    let cancelled = false;
    setState((current) => ({
      ...INITIAL,
      intent: current.intent,
    }));

    void loadCoffeeShotSdk(sdkOrigin)
      .then((sdk) => {
        if (cancelled) {
          return;
        }
        setState((current) => ({
          ...current,
          sdk,
          sdkError: null,
          compatibility: sdk.checkCompatibility(),
        }));
      })
      .catch((caught) => {
        if (cancelled) {
          return;
        }
        setState((current) => ({
          ...current,
          sdk: null,
          sdkError: getErrorMessage(caught, `Impossible de charger ${sdkOrigin}/sdk.mjs`),
        }));
      });

    return () => {
      cancelled = true;
    };
  }, [loadKey]);

  useEffect(() => {
    const sdk = state.sdk;
    const intent = state.intent;
    if (!sdk || !intent) {
      return;
    }

    const client = sdk.createClient({
      apiUrl: apiBaseUrl || undefined,
      analyzePath,
      locale: 'fr',
      source: 'coffeeshot-test-website',
      overlay: false,
      previewElement: videoRef.current ?? undefined,
    });
    clientRef.current = client;

    const unsubscribe = client.on('*', (event) => {
      if (event.type === 'ready') {
        setState((current) => ({
          ...current,
          facing: event.data.facing,
          demo: event.data.demo,
        }));
        return;
      }
      if (event.type === 'hint') {
        setState((current) => ({ ...current, hint: event.data.text }));
        return;
      }
      if (event.type === 'banner') {
        setState((current) => ({ ...current, banner: event.data.message }));
        return;
      }
      if (event.type === 'status') {
        setState((current) => ({
          ...current,
          clientState: event.data.status,
          progress:
            event.data.status === 'analyzing' && typeof event.data.progress === 'number'
              ? event.data.progress
              : current.progress,
          uploadStatus:
            event.data.status === 'analyzing' || event.data.status === 'capturing'
              ? 'uploading'
              : current.uploadStatus,
        }));
        return;
      }
      if (event.type === 'result') {
        setState((current) => ({
          ...current,
          result: event.data,
          uploadStatus: 'success',
          progress: 100,
          error: null,
        }));
        return;
      }
      if (event.type === 'error') {
        setState((current) => ({
          ...current,
          error: event.data.message,
          uploadStatus: current.capturedUri ? 'error' : current.uploadStatus,
        }));
      }
    });

    if (videoRef.current) {
      client.attachPreview(videoRef.current);
    }

    void client.start({ demo: intent === 'demo' }).catch((caught) => {
      const code = getSdkErrorCode(caught);
      const message =
        code === 'permission_denied'
          ? 'L’accès à la caméra a été refusé. Autorisez-la dans les réglages du site, ou continuez en mode démo.'
          : getErrorMessage(caught, 'Impossible de démarrer la caméra');
      setState((current) => ({
        ...current,
        intent: null,
        error: message,
        clientState: 'idle',
      }));
    });

    return () => {
      unsubscribe();
      client.destroy();
      clientRef.current = null;
    };
  }, [state.sdk, state.intent]);

  const attachPreview = useCallback((video: HTMLVideoElement) => {
    videoRef.current = video;
    clientRef.current?.attachPreview(video);
  }, []);

  const start = useCallback((intent: SessionIntent) => {
    setState((current) => ({
      ...current,
      intent,
      capturedUri: null,
      result: null,
      error: null,
      uploadStatus: 'idle',
      progress: 0,
    }));
  }, []);

  const reloadSdk = useCallback(() => {
    setLoadKey((value) => value + 1);
  }, []);

  const flip = useCallback(async () => {
    const client = clientRef.current;
    if (!client) {
      return;
    }
    try {
      await client.flip();
    } catch (caught) {
      setState((current) => ({
        ...current,
        banner: getErrorMessage(caught, 'Changement de caméra impossible'),
      }));
    }
  }, []);

  const capture = useCallback(async () => {
    const client = clientRef.current;
    if (!client) {
      return;
    }
    try {
      const still = await client.capture();
      setState((current) => ({
        ...current,
        capturedUri: still.uri,
        uploadStatus: 'uploading',
        progress: 0,
        result: null,
        error: null,
      }));
    } catch (caught) {
      setState((current) => ({
        ...current,
        banner: getErrorMessage(caught, 'Capture impossible'),
        error: getErrorMessage(caught, 'Capture impossible'),
        uploadStatus: 'error',
      }));
    }
  }, []);

  const retry = useCallback(() => {
    const client = clientRef.current;
    if (!client) {
      return;
    }
    setState((current) => ({
      ...current,
      uploadStatus: 'uploading',
      progress: 0,
      result: null,
      error: null,
    }));
    void client.analyze().catch((caught) => {
      setState((current) => ({
        ...current,
        error: getErrorMessage(caught, 'Analyse impossible'),
        uploadStatus: 'error',
      }));
    });
  }, []);

  const retake = useCallback(() => {
    const client = clientRef.current;
    const demo = state.intent === 'demo';
    setState((current) => ({
      ...current,
      capturedUri: null,
      uploadStatus: 'idle',
      progress: 0,
      result: null,
      error: null,
    }));
    if (!client) {
      return;
    }
    void client.start({ demo }).catch((caught) => {
      setState((current) => ({
        ...current,
        banner: getErrorMessage(caught, 'Impossible de relancer la caméra'),
      }));
    });
  }, [state.intent]);

  return {
    ...state,
    attachPreview,
    start,
    reloadSdk,
    flip,
    capture,
    retry,
    retake,
  };
}
