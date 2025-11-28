import type { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';

export function registerApiErrorHandler(app: Hono<any>) {
    app.onError((err, c) => {
        if (err instanceof HTTPException) {
            const status = err.status;
            const message = ((err.res as any)?._body?.message as string | undefined) ?? err.message ?? 'Error';
            const subCode = (err as any).subCode ?? 0;

            return c.json(
                {
                    success: false,
                    responseCode: status,
                    responseCodeSub: subCode,
                    errorMessage: message,
                    result: null
                },
                status
            );
        }

        return c.json(
            {
                success: false,
                responseCode: 500,
                responseCodeSub: 0,
                errorMessage: 'Internal Server Error',
                result: null
            },
            500
        );
    });
}
