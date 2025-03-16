import { SuccessKibanResponse } from '@types';

export interface GenerateRequestBody {
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  fechaNacimiento: string; // yyyy-mm-dd
}

export interface GenerateResponse extends SuccessKibanResponse {
  request: GenerateRequestBody;
  response: {
    rfc: string;
  };
}

export interface PFDataFromRFCRequestBody {
  rfc: string;
}

type Status = 'FOUND' | 'NOT_FOUND';

export interface PersonalData {
  curp: string;
  email: string;
  estatus: Status;
  nombreCompleto: string;
}

export interface PFDataFromRFCResponse extends SuccessKibanResponse {
  request: PFDataFromRFCRequestBody;
  response: PersonalData;
}
