import {
  SuccessKibanResponse,
  KibanBadRequestCode,
  ServiceUnavailableResponse,
} from '@types';
import { HttpErrorResponse } from '@angular/common/http';

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
      field: string;
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
