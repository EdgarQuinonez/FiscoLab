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
