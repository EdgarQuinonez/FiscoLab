import { HttpErrorResponse } from '@angular/common/http';

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

export interface ValidateRFCSuccessResponse extends SuccessKibanResponse {
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

type ValidateRFCBadRequestCode =
  | 'REQUIRED_FIELD_ERROR'
  | 'FORMAT_ERROR'
  | 'EMPTY_ERROR';

export interface ValidateRFCBadRequestResponse extends HttpErrorResponse {
  error: [
    {
      code: ValidateRFCBadRequestCode;
      field: string;
      message: string;
    }
  ];
}

export interface ValidateRFCServiceUnavailableResponse
  extends ServiceUnavailableResponse {
  request: ValidateRFCRequestBody;
}

export type RFC =
  | ValidateRFCSuccessResponse
  | ValidateRFCBadRequestResponse
  | ValidateRFCServiceUnavailableResponse;

export type ValidateRFCWithDataResult =
  | ValidateRFCResult
  | 'El nombre, denominación o razón social no coincide con el registrado en el RFC'
  | 'El Código Postal no coincide con el registrado en el RFC';

// export type RFCWithData =
