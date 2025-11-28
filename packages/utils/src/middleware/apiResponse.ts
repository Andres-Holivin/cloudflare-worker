import type { Context, Next } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import { buildSuccess, buildError } from '../lib/ApiResponse';

export async function apiResponseMiddleware(c: Context, next: Next) {
    c.ApiResponse = function <T>(result: T, code = 200, subCode = 0) {
        const status = code as ContentfulStatusCode;
        return c.json(buildSuccess(result, code, subCode), status);
    };

    c.ApiError = function (message: string, code = 500, subCode = 0) {
        const status = code as ContentfulStatusCode;
        return c.json(buildError(message, code, subCode), status);
    };

    await next();
}
