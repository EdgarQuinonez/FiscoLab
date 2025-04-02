import { FormControl, FormGroup } from '@angular/forms';
import { TipoSujetoCode } from '@shared/types';

export interface RfcFormFormGroup {
  rfc: FormControl<string | null>;
  tipoSujeto: FormControl<TipoSujetoCode | null>;
  data: FormGroup<{
    pfData: FormGroup<RfcFormPFDataFormGroup>;
    pmData: FormGroup<RfcFormPMDataFormGroup>;
    cp: FormControl<string | null>;
  }>;
}

export interface RfcFormPFDataFormGroup {
  nombre: FormControl<string | null>;
  apellido: FormControl<string | null>;
}

export interface RfcFormPMDataFormGroup {
  razonSocial: FormControl<string | null>;
}

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
