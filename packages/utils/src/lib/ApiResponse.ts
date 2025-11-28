export type ApiResponseSuccess<T> = {
    success: true;
    responseCode: number;
    responseCodeSub: number;
    errorMessage: null;
    result: T;
};

export type ApiResponseError = {
    success: false;
    responseCode: number;
    responseCodeSub: number;
    errorMessage: string;
    result: null;
};

export type ApiResponse<T> = ApiResponseSuccess<T> | ApiResponseError;

export function buildSuccess<T>(result: T, code = 200, subCode = 0): ApiResponse<T> {
    return {
        success: true,
        responseCode: code,
        responseCodeSub: subCode,
        errorMessage: null,
        result
    };
}

export function buildError(message: string, code = 500, subCode = 0): ApiResponse<null> {
    return {
        success: false,
        responseCode: code,
        responseCodeSub: subCode,
        errorMessage: message,
        result: null
    };
}
