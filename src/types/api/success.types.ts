export enum STATUS_CODE {
    OK = 200,
    CREATED = 201,
    ACCEPTED = 202,
    NO_CONTENT = 204
}

export interface SuccessResponse<T> {
    statusCode: STATUS_CODE
    message: string
    data: T
}
