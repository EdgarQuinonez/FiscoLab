import { GenderCode } from '@shared/services/curp.service.interface';
import { TipoSujetoCode } from '@shared/types';

export interface MainFormValue {
  clave: string; // rfc or curp.
  tipoSujeto: TipoSujetoCode;
}

export interface CurpDataFormValue {
  nombres: string;
  primerApellido: string;
  segundoApellido: string;
  fechaNacimiento: Date;
  claveEntidad: {
    name: string;
    code: string;
  };
  sexo: {
    name: string;
    code: string;
  };
}
