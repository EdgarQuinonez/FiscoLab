import { TipoSujetoCode } from '@shared/types'

export interface MainFormValue {
    clave: string // rfc or curp.
    tipoSujeto: TipoSujetoCode
}