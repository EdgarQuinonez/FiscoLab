import { HttpErrorResponse } from '@angular/common/http';
import {
  SuccessKibanResponse,
  ServiceUnavailableResponse,
  KibanBadRequestCode,
  ClavesEstados,
  ClavesMunicipios,
} from '@shared/types';
import { ValidateCurpSuccessResponse } from './curp.service.interface';

export interface ValidateRFCRequestBody {
  rfcs: { rfc: string }[];
}

export type ValidateRFCResult =
  | 'RFC válido, y susceptible de recibir facturas'
  | 'RFC no registrado en el padrón de contribuyentes';

export interface ValidateRFCSuccessResponse extends SuccessKibanResponse {
  request: ValidateRFCRequestBody;
  response: {
    rfcs: {
      result: ValidateRFCResult;
      rfc: string;
    }[];
  };
}

export interface ValidateRfcBadRequestResponse extends HttpErrorResponse {
  error: [
    {
      code: KibanBadRequestCode;
      field: string;
      message: string;
    }
  ];
}

export interface ValidateRFCServiceUnavailableResponse
  extends ServiceUnavailableResponse {
  request: ValidateRFCRequestBody;
}

export type Rfc =
  | ValidateRFCSuccessResponse
  | ValidateRfcBadRequestResponse
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
      code: KibanBadRequestCode;
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
  | ValidateRFCWithDataBadRequestResponse
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
      code: KibanBadRequestCode;
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

export interface ObtainPersonalDataPfRfcRequest {
  rfc: string;
}

export interface ObtainPersonalDataPfRfcSuccessResponse
  extends SuccessKibanResponse {
  request: ObtainPersonalDataPfRfcRequest;
  response:
    | ObtainPersonalDataPfRfcSuccessFoundResponse
    | ObtainPersonalDataPfRfcSuccessNotFoundResponse;
}

export interface ObtainPersonalDataPfRfcSuccessFoundResponse {
  curp: string;
  email: string;
  estatus: 'FOUND';
  nombreCompleto: string;
}

export interface ObtainPersonalDataPfRfcSuccessNotFoundResponse {
  estatus: 'NOT_FOUND';
  message: string;
}

export interface ObtainPersonalDataPfRfcBadRequest extends HttpErrorResponse {
  error: {
    code: KibanBadRequestCode | 'LENGTH_ERROR';
    message: string;
    field: 'rfc';
  }[];
}

// TODO: all ServiceUnavailable responses should look like this.
export interface ObtainPersonalDataPfRfcServiceUnavailable
  extends HttpErrorResponse {
  error: Omit<ServiceUnavailableResponse, 'request'> & {
    request: ObtainPersonalDataPfRfcRequest;
  };
}

export type ObtainPersonalDataPfRfc =
  | ObtainPersonalDataPfRfcSuccessResponse
  | ObtainPersonalDataPfRfcBadRequest
  | ObtainPersonalDataPfRfcServiceUnavailable;

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
      code: KibanBadRequestCode;
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

export interface ValidateRfcCpQueryRequest {
  rfc: string;
  nombre: string;
  estado?: ClavesEstados;
  municipio?: ClavesMunicipios;
}

export interface ValidateCodigoPostalRequest {
  codigoPostal: string;
}

export interface ValidateCodigoPostalSuccessFoundResponse {
  Asentamiento: string;
  Ciudad: string;
  ClaveDeOficina: string;
  CodigoPostal: string;
  DelegacionMunicipio: string;
  Estado: string;
  TipoDeAsentamiento: string;
}

export interface ValidateCodigoPostalSuccessResponse
  extends SuccessKibanResponse {
  request: ValidateCodigoPostalRequest;
  response: ValidateCodigoPostalSuccessFoundResponse[] | []; // empty array when not found
}

export interface ValidateCodigoPostalBadRequestResponse
  extends HttpErrorResponse {
  error: {
    code: 'LENGTH_ERROR' | 'FORMAT_ERROR';
    message: string;
    field: string;
  }[];
}

export interface ValidateCodigoPostalServiceUnavailableResponse
  extends HttpErrorResponse {
  error: ServiceUnavailableResponse & {
    request: ValidateCodigoPostalRequest;
  };
}

export type ValidateCodigoPostal =
  | ValidateCodigoPostalSuccessResponse
  | ValidateCodigoPostalBadRequestResponse
  | ValidateCodigoPostalServiceUnavailableResponse;
