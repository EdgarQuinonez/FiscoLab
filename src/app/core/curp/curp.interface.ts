import { HttpErrorResponse } from '@angular/common/http';
import { ServiceUnavailableResponse, SuccessKibanResponse } from '@types';

export interface CurpRequestBody {
  curp: string;
}

export interface SuccessResponse extends SuccessKibanResponse {
  status: 'SUCCESS';
}

type CurpSuccessStatus = 'FOUND' | 'NOT_FOUND' | 'NOT_VALID';

export type Gender = 'HOMBRE' | 'MUJER' | 'NO BINARIO';

export interface CurpFoundResponseData {
  claveEntidad: string;
  curp: string;
  datosDocProbatorio: {
    anioReg: string;
    claveEntidadRegistro: string;
    claveMunicipioRegistro: string;
    entidadRegistro: string;
    municipioRegistro: string;
    numActa: string;
  };
  docProbatorio: number;
  docProbatorioDescripcion: string;
  entidad: string;
  fechaNacimiento: string;
  nacionalidad: string;
  nombres: string;
  primerApellido: string;
  segundoApellido: string;
  sexo: Gender;
  status: 'FOUND';
  statusCurp: string;
  statusCurpDescripcion: string;
}

export interface CurpNotFoundResponseData {
  status: 'NOT_FOUND';
}

export interface CurpNotValidResponseData {
  claveEntidad: string;
  curp: string;
  datosDocProbatorio:
    | {
        folioRefugiado: string;
      }
    | {
        anioReg: string;
        claveEntidadRegistro: string;
        claveMunicipioRegistro: string;
        entidadRegistro: string;
        municipioRegistro: string;
        numActa: string;
      }
    | Object;
  docProbatorio: number;
  docProbatorioDescripcion: string;
  entidad: string;
  fechaNacimiento: string;
  nacionalidad: string;
  nombres: string;
  primerApellido: string;
  segundoApellido: string;
  sexo: Gender;
  status: 'NOT_VALID';
  statusCurp: string;
  statusCurpDescripcion: string;
}

export interface CurpResponse extends SuccessResponse {
  response:
    | CurpFoundResponseData
    | CurpNotFoundResponseData
    | CurpNotValidResponseData;
  request: CurpRequestBody;
}

type CurpBadRequestCode =
  | 'REQUIRED_FIELD_ERROR'
  | 'FORMAT_ERROR'
  | 'EMPTY_ERROR';

export interface CurpBadRequestResponse extends HttpErrorResponse {
  error: [
    {
      code: CurpBadRequestCode;
      field: string;
      message: string;
    }
  ];
}

export interface CurpServiceUnavailableResponse
  extends ServiceUnavailableResponse {
  request: CurpRequestBody;
}

export type Curp =
  | CurpResponse
  | CurpBadRequestResponse
  | CurpServiceUnavailableResponse;

export type GenderCode = 'H' | 'M' | 'X';

export interface CurpValidateByDataRequest {
  claveEntidad: string;
  fechaNacimiento: string; // yyyy-MM-dd format
  nombres: string;
  primerApellido: string;
  segundoApellido: string;
  sexo: GenderCode;
}

export interface CurpValidateByDataResponse
  extends Omit<CurpResponse, 'request'> {
  request: CurpValidateByDataRequest;
}

export interface CurpValidateByDataServiceUnavailableResponse
  extends Omit<CurpServiceUnavailableResponse, 'request'> {
  request: CurpValidateByDataRequest;
}

export type CurpByData =
  | CurpValidateByDataResponse
  | CurpBadRequestResponse
  | CurpValidateByDataServiceUnavailableResponse;
