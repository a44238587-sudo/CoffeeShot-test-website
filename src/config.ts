function trimSlash(value: string): string {
  return value.replace(/\/+$/, '');
}

export const apiBaseUrl = trimSlash(process.env.EXPO_PUBLIC_API_URL ?? '');

export const analyzePath = process.env.EXPO_PUBLIC_ANALYZE_PATH?.trim() || '/analyze';

export const analyzeUrl = apiBaseUrl
  ? `${apiBaseUrl}${analyzePath.startsWith('/') ? analyzePath : `/${analyzePath}`}`
  : '';

export const hasRemoteApi = Boolean(apiBaseUrl);
