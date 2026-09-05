export type AnalyzeSource = 'api' | 'mock';

export type AnalyzeResult = {
  source: AnalyzeSource;
  title: string;
  score?: number;
  tips: string[];
  raw?: unknown;
};

export type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';
