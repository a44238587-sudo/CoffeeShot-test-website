import { sdkOrigin } from '../config';
import type { CoffeeShotSdk } from './types';

function sdkUrl(origin: string): string {
  return `${origin.replace(/\/+$/, '')}/sdk.mjs`;
}

function importSpecifier(specifier: string): Promise<CoffeeShotSdk> {
  // Metro resolves static import() specifiers at bundle time. A runtime
  // Function keeps the CDN URL out of the web bundle graph.
  const importer = new Function('u', 'return import(u)') as (u: string) => Promise<CoffeeShotSdk>;
  return importer(specifier);
}

function assertSdk(module: unknown): CoffeeShotSdk {
  if (
    module &&
    typeof module === 'object' &&
    'checkCompatibility' in module &&
    'createClient' in module &&
    typeof (module as CoffeeShotSdk).checkCompatibility === 'function' &&
    typeof (module as CoffeeShotSdk).createClient === 'function'
  ) {
    return module as CoffeeShotSdk;
  }
  throw new Error('Le module CoffeeShot SDK est incomplet (checkCompatibility / createClient).');
}

export async function loadCoffeeShotSdk(origin: string = sdkOrigin): Promise<CoffeeShotSdk> {
  const url = sdkUrl(origin);
  try {
    return assertSdk(await importSpecifier(url));
  } catch (first) {
    const response = await fetch(url, { mode: 'cors' });
    if (!response.ok) {
      throw first instanceof Error
        ? first
        : new Error(`Impossible de charger le SDK (${response.status}).`);
    }
    const source = await response.text();
    const objectUrl = URL.createObjectURL(new Blob([source], { type: 'text/javascript' }));
    try {
      return assertSdk(await importSpecifier(objectUrl));
    } catch {
      throw first instanceof Error ? first : new Error(`Impossible de charger ${url}`);
    }
  }
}
