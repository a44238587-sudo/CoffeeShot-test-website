export type Facing = 'front' | 'back';

export type CompatibilityReason = 'not_browser' | 'insecure_context' | 'no_media_devices';

export type CompatibilityReport = {
  supported: boolean;
  reason?: CompatibilityReason;
  cameras?: number;
};

export type ClientState =
  | 'idle'
  | 'starting'
  | 'previewing'
  | 'flipping'
  | 'capturing'
  | 'analyzing'
  | 'stopped'
  | 'destroyed';

export type AnalyzeResult = {
  source: 'api' | 'mock';
  title: string;
  score?: number;
  tips: string[];
  raw?: unknown;
};

export type CoffeeShotErrorCode =
  | 'unsupported'
  | 'permission_denied'
  | 'camera_unavailable'
  | 'not_started'
  | 'destroyed'
  | 'busy'
  | 'capture_failed'
  | 'analyze_failed'
  | 'invalid_config';

export type CoffeeShotEvent =
  | { type: 'ready'; data: { facing: Facing; cameras?: number; demo: boolean } }
  | { type: 'hint'; data: { text: string; index: number } }
  | { type: 'status'; data: { status: ClientState; progress?: number; message?: string } }
  | { type: 'banner'; data: { message: string; reason: string } }
  | { type: 'result'; data: AnalyzeResult }
  | { type: 'error'; data: { code: CoffeeShotErrorCode; message: string } };

export type CaptureResult = {
  blob: Blob;
  uri: string;
};

export type FlipResult = {
  flipped: boolean;
  facing: Facing;
  reason?: 'single_camera' | 'unavailable' | 'demo';
};

export type StartResult = {
  demo: boolean;
  facing: Facing;
  cameras?: number;
};

export type CoffeeShotClient = {
  readonly state: ClientState;
  readonly facing: Facing;
  on(event: '*', handler: (event: CoffeeShotEvent) => void): () => void;
  attachPreview(element: HTMLVideoElement | string): void;
  start(options?: { demo?: boolean }): Promise<StartResult>;
  flip(): Promise<FlipResult>;
  capture(): Promise<CaptureResult>;
  analyze(input?: Blob | string): Promise<AnalyzeResult>;
  stop(): Promise<void>;
  destroy(): void;
};

export type CoffeeShotSdk = {
  checkCompatibility: () => CompatibilityReport;
  createClient: (config?: {
    apiUrl?: string;
    analyzePath?: string;
    previewElement?: HTMLVideoElement | string;
    overlay?: boolean | HTMLElement | string;
    locale?: 'fr' | 'en';
    source?: string;
    quality?: number;
    hintIntervalMs?: number;
  }) => CoffeeShotClient;
};

export function getSdkErrorCode(error: unknown): CoffeeShotErrorCode | undefined {
  if (error && typeof error === 'object' && 'code' in error && typeof (error as { code: unknown }).code === 'string') {
    return (error as { code: CoffeeShotErrorCode }).code;
  }
  return undefined;
}

export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}
