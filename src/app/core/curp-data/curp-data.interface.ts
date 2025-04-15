import {
  Gender,
  LetterClaveEntidad,
} from '@shared/services/curp.service.interface';
import { ClavesEstados, ClavesMunicipios } from '@shared/types';

export interface CurpDataData {
  nombreCompleto: string; // from obtain rfc personal data.
  sexo: Gender;
  fechaNacimiento: string;
  entidad: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  curp: string;
  claveEntidad: LetterClaveEntidad;
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
  nacionalidad: string;
  primerApellido: string;
  segundoApellido: string;
  statusCurp: string;
  statusCurpDescripcion: string;
}
