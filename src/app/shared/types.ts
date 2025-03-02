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

export interface LoadingState<T = unknown> {
    loading: boolean;
    error?: Error | null;
    data?: T;    
}

