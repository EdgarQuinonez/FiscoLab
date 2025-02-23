import { KibanResponse } from "@types"

export interface ValidateRequestBody {
    rfcs: [
        {
            rfc: string
        }
    ]
}

export interface ValidateResponse extends KibanResponse {
    request: {
        rfcs: [
            {
                rfc: string
            }
        ]
    },
    response: {
        rfcs: [
            {
                result: string,
                rfc: string
            }
        ]
    }
}