export interface SuccessKibanResponse {
  id: string;
  finishedAt: string;
  duration: number;
  createdAt: string;
  request: Object;
  response: Object;
  status: 'SUCCESS';
}

export interface LoadingState<T = unknown> {
  loading: boolean;
  error?: Error | null;
  data?: T;
}

export interface ServiceUnavailableResponse {
  id: string;
  finishedAt: string;
  duration: number;
  createdAt: string;
  request: Object;
  errorMessage: string;
  status: 'SERVICE_ERROR';
}

export type TipoSujetoCode = 'PM' | 'PF';

export type KibanBadRequestCodeResponse =
  | 'FORMAT_ERROR'
  | 'EMPTY_ERROR'
  | 'REQUIRED_FIELD_ERROR';
