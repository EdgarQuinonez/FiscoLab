import { TipoSujetoCode } from '@shared/types';

export interface RfcFormValue {
  rfc: string;
  tipoSujeto: TipoSujetoCode;
  data: { cp: null; nombre: null; apellido: null };
}

export interface RfcFormWithDataValue {
  rfc: string;
  tipoSujeto: TipoSujetoCode;
  data: { cp: string; nombre: string; apellido: string };
}
