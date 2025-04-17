export interface RfcPfData {
  rfc: string;
  curp: string;
  email: string;
  nombreCompleto: string;
  codigoPostal: string;
  rfcResult: string;
  asentamiento: string;
  ciudad: string;
  claveDeOficina: string;
  delegacionMunicipio: string;
  estado: string;
  tipoDeAsentamiento: string;
}

export interface CodigoPostalData {
  codigoPostal: string;
  asentamiento: string;
  ciudad: string;
  claveDeOficina: string;
  delegacionMunicipio: string;
  estado: string;
  tipoDeAsentamiento: string;
}

export interface MediosContactoData {
  email: string;
}
