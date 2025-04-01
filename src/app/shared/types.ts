import cpCatalog from '@public/cp.catalog.json';

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


export type ClavesEstados = keyof typeof cpCatalog
export type ClavesMunicipios = keyof (typeof cpCatalog)[keyof typeof cpCatalog];

// LOCAL STORAGE KEYS
// rfc
// rfcResult: retrieved from rfc validation.
// tipoSujeto: user input when 'PF' | 'PM'
// curp
// personalData: retrieved from curp validation
// cp: Código Postal validado
// nombre: Nombre o Razón Social retrieved from validate rfc with data response.