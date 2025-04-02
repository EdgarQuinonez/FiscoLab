import { TipoSujetoCode } from '@shared/types';

export interface RfcFormValue {
  rfc: string;
  tipoSujeto: TipoSujetoCode;
  data: { cp: null; nombre: null; apellido: null; razonSocial: null };
}

export interface RfcFormWithDataValue {
  rfc: string;
  tipoSujeto: TipoSujetoCode;
  data: {
    cp: string;
    nombre?: string;
    apellido?: string;
    razonSocial?: string;
  };
}

export interface RfcFormWithDataValueOnCPAutocomplete
  extends Omit<RfcFormWithDataValue, 'data'> {
  rfc: string;
  tipoSujeto: TipoSujetoCode;
  data: {
    cp: null;
    nombre: string;
    apellido: string;
    razonSocial: string;
  };
}
