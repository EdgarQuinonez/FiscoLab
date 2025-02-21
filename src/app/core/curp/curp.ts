type Status = "SUCCESS" | "SERVICE_ERROR"

export interface KibanResponse {
    id: string,
    finishedAt: Date,
    duration: number,
    createdAt: Date,
    request: Object,
    response: Object,
    status: Status
}

type CurpSuccessStatus = "FOUND" | "NOT_FOUND" | "NOT_VALID"

export interface Curp extends KibanResponse {
    response: {
        claveEntidad: string,
        curp: string,
        datosDocProbatorio: {
            anioReg: string,
            claveEntidadRegistro: string,
            claveMunicipioRegistro: string,
            entidadRegistro: string,
            municipioRegistro: string,
            numActa: string
        }
        docProbatorio: number,
        docProbatorioDescripcion: string,
        entidad: string,
        fechaNacimiento: Date,
        nacionalidad: string,
        nombres: string,
        primerApellido: string,
        segundoApellido: string,
        sexo: "HOMBRE" | "MUJER",
        status: "FOUND",
        statusCurp: string,
        statusCurpDescripcion: string
    },
    request: {
        curp: string
    }

}


// TODO: Add interfaces to handle NOT_FOUND and NOT_VALID
type CurpBadRequestCode = "REQUIRED_FIELD_ERROR" | "FORMAT_ERROR" | "EMPTY_ERROR"

export interface CurpBadRequest {
    error: [ {
        code: CurpBadRequestCode,
        field: string,
        message: string,
    } ],
    headers: Object,
    message: string,
    name: string,
    ok: boolean,
    status: 400,
    statusText: string,
    type: unknown,
    url: string    
}


export interface CurpServiceUnavailable extends KibanResponse {
    status: "SERVICE_ERROR",
    errorMessage: string,
    request: {
        curp: string
    }
}