import { TipoSujetoCode } from '@shared/types';

export interface RfcFormValue {
  tipoSujeto: TipoSujetoCode;
  pfDataForm: {
    nombres: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    fechaNacimiento: Date;
  };
  pmDataForm: {
    fechaConstitucion: Date;
    razonSocial: string;
  };
  data: {
    cp: string;
  };
}
