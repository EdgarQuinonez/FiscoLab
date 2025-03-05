import { HttpErrorResponse } from '@angular/common/http';
import { ServiceUnavailableResponse, SuccessKibanResponse } from '@types';

export interface CurpRequestBody {
  curp: string;
}

export interface SuccessResponse extends SuccessKibanResponse {
  status: 'SUCCESS';
}

type CurpSuccessStatus = 'FOUND' | 'NOT_FOUND' | 'NOT_VALID';

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
  sexo: 'HOMBRE' | 'MUJER';
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
  sexo: 'HOMBRE' | 'MUJER';
  status: 'NOT_VALID';
  statusCurp: string;
  statusCurpDescripcion: string;
}

export interface CurpResponse extends SuccessResponse {
  response:
    | CurpFoundResponseData
    | CurpNotFoundResponseData
    | CurpNotValidResponseData;
  request: {
    curp: string;
  };
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
  request: {
    curp: string;
  };
}

export type Curp =
  | CurpResponse
  | CurpBadRequestResponse
  | CurpServiceUnavailableResponse;
