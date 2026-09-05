import { analyzeUrl, hasRemoteApi } from '../config';
import type { AnalyzeResult } from '../types';
import { appendCapturedImage } from './picture';

const MOCK_TIPS = [
  'Le sujet est bien posé sur la grille des tiers.',
  'Lumière chaude — parfait pour un rendu CoffeeShot.',
  'Un peu plus d’air au-dessus du sujet donnerait plus de respiration.',
];

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseApiPayload(payload: unknown): Omit<AnalyzeResult, 'source'> {
  if (payload && typeof payload === 'object') {
    const data = payload as Record<string, unknown>;
    const tips = Array.isArray(data.tips)
      ? data.tips.filter((tip): tip is string => typeof tip === 'string')
      : typeof data.message === 'string'
        ? [data.message]
        : [];

    return {
      title: typeof data.title === 'string' ? data.title : 'Analyse reçue',
      score: typeof data.score === 'number' ? data.score : undefined,
      tips: tips.length > 0 ? tips : ['Réponse reçue du backend.'],
      raw: payload,
    };
  }

  return {
    title: 'Analyse reçue',
    tips: [typeof payload === 'string' && payload ? payload : 'Réponse vide du serveur.'],
    raw: payload,
  };
}

async function mockAnalyze(
  imageUri: string,
  onProgress: (percent: number) => void,
): Promise<AnalyzeResult> {
  console.info('[CoffeeShot] Aucune EXPO_PUBLIC_API_URL — analyse locale (mock).', {
    imageUri: imageUri.slice(0, 48),
  });

  for (let percent = 8; percent <= 100; percent += 12) {
    onProgress(Math.min(percent, 100));
    await sleep(90);
  }

  return {
    source: 'mock',
    title: 'Composition équilibrée',
    score: 87,
    tips: MOCK_TIPS,
  };
}

function uploadWithProgress(
  url: string,
  formData: FormData,
  onProgress: (percent: number) => void,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && event.total > 0) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(xhr.responseText ?? '');
        return;
      }
      reject(new Error(`HTTP ${xhr.status}${xhr.responseText ? `: ${xhr.responseText.slice(0, 180)}` : ''}`));
    };
    xhr.onerror = () => reject(new Error('Réseau indisponible'));
    xhr.onabort = () => reject(new Error('Envoi interrompu'));
    xhr.send(formData);
  });
}

async function uploadAnalyze(
  imageUri: string,
  onProgress: (percent: number) => void,
): Promise<AnalyzeResult> {
  const formData = new FormData();
  await appendCapturedImage(formData, 'image', imageUri);
  formData.append('source', 'coffeeshot-test-website');

  const body = await uploadWithProgress(analyzeUrl, formData, onProgress);
  let payload: unknown = body;
  try {
    payload = body ? JSON.parse(body) : {};
  } catch {
    payload = body;
  }

  return {
    source: 'api',
    ...parseApiPayload(payload),
  };
}

export async function analyzePhoto(
  imageUri: string,
  onProgress: (percent: number) => void,
): Promise<AnalyzeResult> {
  if (!hasRemoteApi) {
    return mockAnalyze(imageUri, onProgress);
  }
  return uploadAnalyze(imageUri, onProgress);
}
