import { ClavesEstados, ClavesMunicipios } from '@shared/types';

export interface QueryCPFormValue {
  estado?: {
    c_estado: ClavesEstados;
    d_estado: string;
  } | null | undefined;
  municipio?: {
    c_mnpio: ClavesMunicipios;
    D_mnpio: string;
  } | null | undefined;
}
