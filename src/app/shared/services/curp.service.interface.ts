import {
  SuccessKibanResponse,
  KibanBadRequestCode,
  ServiceUnavailableResponse,
  ClavesEstados,
  ClavesMunicipios,
} from '@types';
import { HttpErrorResponse } from '@angular/common/http';
import curpCatalog from '@public/curp.catalog.json';

export type Gender = 'HOMBRE' | 'MUJER' | 'NO BINARIO';
export type GenderCode = 'H' | 'M' | 'X';
export type CurpStatusCode =
  | 'AN' // Alta Normal
  | 'AH' // Alta con homonimia
  | 'RCC' // Registro de cambio afectando a CURP
  | 'RCN' // Registro de cambio no afectando a CURP
  | 'BAP' // Baja por documento apócrifo
  | 'BSU' // Baja sin uso
  | 'BD' // Baja por defunción
  | 'BDM' // Baja administrativa
  | 'BDP' // Baja por adopción
  | 'BJD'; // Baja Judicial

export type CurpStatusDescription =
  | 'Alta Normal'
  | 'Alta con homonimia'
  | 'Registro de cambio afectando a CURP'
  | 'Registro de cambio no afectando a CURP'
  | 'Baja por documento apócrifo'
  | 'Baja sin uso'
  | 'Baja por defunción'
  | 'Baja administrativa'
  | 'Baja por adopción'
  | 'Baja Judicial';

export type CurpStatusMap = {
  [code in CurpStatusCode]: CurpStatusDescription;
};

export const CURP_STATUS_MAP: CurpStatusMap = {
  AN: 'Alta Normal',
  AH: 'Alta con homonimia',
  RCC: 'Registro de cambio afectando a CURP',
  RCN: 'Registro de cambio no afectando a CURP',
  BAP: 'Baja por documento apócrifo',
  BSU: 'Baja sin uso',
  BD: 'Baja por defunción',
  BDM: 'Baja administrativa',
  BDP: 'Baja por adopción',
  BJD: 'Baja Judicial',
};

export interface ValidateCurpRequest {
  curp: string;
}

export interface ValidateCurpFoundResponse {
  claveEntidad: keyof (typeof curpCatalog)['STATES'];
  curp: string;
  datosDocProbatorio: {
    anioReg: string;
    claveEntidadRegistro: ClavesEstados;
    claveMunicipioRegistro: ClavesMunicipios;
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

export interface ValidateCurpNotFoundResponse {
  status: 'NOT_FOUND';
}

export interface ValidateCurpNotValidResponse {
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
  statusCurp: CurpStatusCode;
  statusCurpDescripcion: CurpStatusDescription;
}

export interface ValidateCurpSuccessResponse extends SuccessKibanResponse {
  response:
    | ValidateCurpFoundResponse
    | ValidateCurpNotFoundResponse
    | ValidateCurpNotValidResponse;
  request: ValidateCurpRequest;
}

export interface ValidateCurpBadRequestResponse extends HttpErrorResponse {
  error: [
    {
      code: KibanBadRequestCode;
      field: string; // TODO: Instead of hardcoding here maybe it is good idea to have keys from the request obj maybe. Only problem would be indexes.
      message: string;
    }
  ];
}

export interface ValidateCurpServiceUnavailableResponse
  extends ServiceUnavailableResponse {
  request: ValidateCurpRequest;
}

export type Curp =
  | ValidateCurpSuccessResponse
  | ValidateCurpBadRequestResponse
  | ValidateCurpServiceUnavailableResponse;

export interface ValidateCurpDataRequest {
  claveEntidad: string;
  fechaNacimiento: string; // yyyy-MM-dd format
  nombres: string;
  primerApellido: string;
  segundoApellido?: string | null;
  sexo: string; // H, M, X;
}

export interface ValidateCurpDataSuccessResponse
  extends Omit<ValidateCurpSuccessResponse, 'request'> {
  request: ValidateCurpDataRequest;
}

export interface ValidateCurpDataBadRequestResponse extends HttpErrorResponse {
  error: {
    code: KibanBadRequestCode;
    field: string;
    message: string;
  }[];
}

export interface ValidateCurpDataServiceUnavailableResponse
  extends ServiceUnavailableResponse {
  request: ValidateCurpDataRequest;
}

export type CurpData =
  | ValidateCurpDataSuccessResponse
  | ValidateCurpDataBadRequestResponse
  | ValidateCurpDataServiceUnavailableResponse;
