import { KibanResponse } from "@types"

export interface ValidateRequestBody {
    rfcs: [{ rfc: string }]
}

export interface ValidateResponse extends KibanResponse {
    request: ValidateRequestBody
    response: {
        rfcs: [{
                result: string,
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