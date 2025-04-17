import { Gender } from '@shared/services/curp.service.interface';

export interface PersonalDataData {
  nombreCompleto: string; // from obtain rfc personal data.
  sexo: Gender;
  fechaNacimiento: string;
  nacionalidad: string;
}
