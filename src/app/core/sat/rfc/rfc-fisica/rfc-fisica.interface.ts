import { KibanResponse } from "@types"

export interface ValidateRequestBody {
    rfcs: [{ rfc: string }]
}

export type ValidateRFCResult = "RFC válido, y susceptible de recibir facturas" | "RFC no registrado en el padrón de contribuyentes"

export interface ValidateResponse extends KibanResponse {
    request: ValidateRequestBody
    response: {
        rfcs: [{
                result: ValidateRFCResult,
                rfc: string
        }]
    }
}

export interface GenerateRequestBody {
    nombres: string,
    apellidoPaterno: string,
    apellidoMaterno: string,
    fechaNacimiento: string // yyyy-mm-dd
}

export interface GenerateResponse extends KibanResponse {
    request: GenerateRequestBody,
    response: {
        rfc: string
    }
}

export interface PFDataFromRFCRequestBody {
    rfc: string
}

type Status = "FOUND" | "NOT_FOUND"

export interface PersonalData {
    curp: string,
    email: string,
    estatus: Status,
    nombreCompleto: string
}

export interface PFDataFromRFCResponse extends KibanResponse {
    request: PFDataFromRFCRequestBody,
    response: PersonalData
}

