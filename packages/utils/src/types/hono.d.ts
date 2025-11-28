import 'hono';

declare module 'hono' {
    interface Context {
        ApiResponse<T>(result: T, code?: number, subCode?: number): Response;
        ApiError(message: string, code?: number, subCode?: number): Response;
    }
}
