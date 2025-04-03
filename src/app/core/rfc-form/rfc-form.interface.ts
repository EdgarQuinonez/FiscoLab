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
  data: {
    pfData: {
      nombre: null;
      apellido: null;
    };
    pmData: {
      razonSocial: null;
    };
    cp: null;
  };
}

export interface RfcFormDataValue {
  rfc: string;
  tipoSujeto: TipoSujetoCode;
  data: {
    pfData: RfcFormPfDataValue;
    pmData: RfcFormPmDataValue;
    cp: string;
  };
}

export interface RfcFormValueWithCP {
  rfc: string;
  tipoSujeto: TipoSujetoCode;
  data: {
    pfData: RfcFormPfDataValue;
    pmData: RfcFormPmDataValue;
    cp: null;
  };
}

export interface RfcFormPfDataValue {
  nombre: string;
  apellido: string;
}

export interface RfcFormPmDataValue {
  razonSocial: string;
}
