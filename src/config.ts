function trimSlash(value: string): string {
  return value.replace(/\/+$/, '');
}

export const sdkOrigin = trimSlash(
  process.env.EXPO_PUBLIC_SDK_ORIGIN?.trim() || 'https://coffeeshot-sdk.pages.dev',
);

export const apiBaseUrl = trimSlash(process.env.EXPO_PUBLIC_API_URL ?? '');

export const analyzePath = process.env.EXPO_PUBLIC_ANALYZE_PATH?.trim() || '/analyze';
