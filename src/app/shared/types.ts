import { HttpErrorResponse } from '@angular/common/http';
import cpCatalog from '@public/cp.catalog.json';
import curpCatalog from '@public/curp.catalog.json';

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

export type KibanBadRequestCode =
  | 'FORMAT_ERROR'
  | 'EMPTY_ERROR'
  | 'REQUIRED_FIELD_ERROR';

export type ClavesEstados = keyof typeof cpCatalog;
export type ClavesMunicipios = keyof (typeof cpCatalog)[keyof typeof cpCatalog];
export type ClavesEntidades = keyof (typeof curpCatalog)['STATES'];

export const LOCAL_STORAGE_KEYS = {
  RFC: { key: 'rfc', isJSON: false },
  RFC_RESULT: { key: 'rfcResult', isJSON: false },
  TIPO_SUJETO: { key: 'tipoSujeto', isJSON: false }, // 'PF' | 'PM'
  CURP: { key: 'curp', isJSON: false },
  VALIDATE_CURP_FOUND_RESPONSE: {
    key: 'validateCurpFoundResponse',
    isJSON: true,
  },
  CODIGO_POSTAL: { key: 'cp', isJSON: false },
  VALIDATE_CODIGO_POSTAL_RESPONSE: {
    key: 'validateCodigoPostalResponse',
    isJSON: true,
  },
  RFC_PF_PERSONAL_DATA: { key: 'rfcPfPersonalData', isJSON: true },
} as const;

export type StorageKey = keyof typeof LOCAL_STORAGE_KEYS;
export type StorageValueType<T extends StorageKey> =
  (typeof LOCAL_STORAGE_KEYS)[T]['isJSON'] extends true ? any : string; // either of type 'any' or 'string'
