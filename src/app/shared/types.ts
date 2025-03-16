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

export interface ValidateRFCRequestBody {
  rfcs: [{ rfc: string }];
}

export type ValidateRFCResult =
  | 'RFC válido, y susceptible de recibir facturas'
  | 'RFC no registrado en el padrón de contribuyentes';

export interface ValidateRFCResponse extends SuccessKibanResponse {
  request: ValidateRFCRequestBody;
  response: {
    rfcs: [
      {
        result: ValidateRFCResult;
        rfc: string;
      }
    ];
  };
}
