import { HttpErrorResponse } from '@angular/common/http';
import {
  SuccessKibanResponse,
  ServiceUnavailableResponse,
  KibanBadRequestCodeResponse,
} from '@shared/types';

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

export interface ValidateRFCWithDataRequest {
  rfcs: { rfc: string; cp: string; nombre: string }[];
}

export interface ValidateRFCWithDataSuccessResponse
  extends SuccessKibanResponse {
  request: ValidateRFCWithDataRequest;
  response: {
    rfcs: {
      cp: string;
      nombre: string;
      result: ValidateRFCWithDataResult;
      rfc: string;
    }[];
  };
}

export interface ValidateRFCWithDataBadRequestResponse
  extends HttpErrorResponse {
  error: [
    {
      code: ValidateRFCBadRequestCode;
      field: string;
      message: string;
    }
  ];
}

export interface ValidateRFCWithDataServiceUnavailableResponse
  extends ServiceUnavailableResponse {
  request: ValidateRFCWithDataRequest;
}

export type RFCWithData =
  | ValidateRFCWithDataSuccessResponse
  | ValidateRFCBadRequestResponse
  | ValidateRFCWithDataServiceUnavailableResponse;

export interface GenerateRfcPfRequest {
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  fechaNacimiento: string; // yyyy-mm-dd
}

export interface GenerateRfcPfSuccessResponse extends SuccessKibanResponse {
  request: GenerateRfcPfRequest;
  response: {
    rfc: string;
  };
}

export interface GenerateRfcPfBadRequestResponse extends HttpErrorResponse {
  error: [
    {
      code: KibanBadRequestCodeResponse;
      field: string;
      message: string;
    }
  ];
}

export interface GenerateRfcPfServiceUnavailableResponse
  extends ServiceUnavailableResponse {
  request: GenerateRfcPf;
}

export type GenerateRfcPf =
  | GenerateRfcPfSuccessResponse
  | GenerateRfcPfBadRequestResponse
  | GenerateRfcPfServiceUnavailableResponse;

export interface ObtainPersonalDataPfRFCRequest {
  rfc: string;
}

type Status = 'FOUND' | 'NOT_FOUND';

export interface ObtainPersonalDataPfRFCSuccessResponse
  extends SuccessKibanResponse {
  request: ObtainPersonalDataPfRFCRequest;
  response: {
    curp: string;
    email: string;
    estatus: Status;
    nombreCompleto: string;
  };
}

export type ObtainPersonalDataPfRFC = ObtainPersonalDataPfRFCSuccessResponse;

export interface GenerateRfcPmRequest {
  razonSocial: string;
  fechaConstitucion: string; // yyyy-mm-dd
}

export interface GenerateRfcPmSuccessReponse extends SuccessKibanResponse {
  request: GenerateRfcPmRequest;
  response: {
    rfc: string;
  };
}

export interface GenerateRfcPmBadRequestResponse extends HttpErrorResponse {
  error: [
    {
      code: KibanBadRequestCodeResponse;
      field: string;
      message: string;
    }
  ];
}

export interface GenerateRfcPmServiceUnavailableResponse
  extends ServiceUnavailableResponse {
  request: GenerateRfcPmRequest;
}

export type GenerateRfcPm =
  | GenerateRfcPmSuccessReponse
  | GenerateRfcPmBadRequestResponse
  | GenerateRfcPmServiceUnavailableResponse;
