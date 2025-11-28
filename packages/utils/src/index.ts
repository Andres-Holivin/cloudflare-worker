import type { MiddlewareHandler } from 'hono';
import './types/hono';

export * from './lib/ApiResponse';
export * from './middleware/apiResponse';
export * from './middleware/apiErrorHandler';

const TOKEN_PREFIX = 'token_';

export function hashPassword(password: string): string {
    return password;
}

export function verifyPassword(password: string, hash: string): boolean {
    return password === hash;
}

export function generateToken(userId: number): string {
    return `${TOKEN_PREFIX}${userId}_${Date.now()}`;
}

export type AuthVariables = {
    userId: number;
};

export function decodeToken(token: string): { userId: number } | null {
    if (!token.startsWith(TOKEN_PREFIX)) {
        return null;
    }

    const tokenBody = token.slice(TOKEN_PREFIX.length);
    const [userIdRaw] = tokenBody.split('_');
    const userId = Number(userIdRaw);

    if (!Number.isInteger(userId) || userId <= 0) {
        return null;
    }

    return { userId };
}

export const authMiddleware: MiddlewareHandler<{ Variables: AuthVariables }> = async (c, next) => {
    const authHeader = c.req.header('Authorization');

    if (!authHeader?.startsWith('Bearer ')) {
        return c.ApiError('Unauthorized', 401);
    }

    const token = authHeader.slice('Bearer '.length).trim();
    const payload = decodeToken(token);

    if (!payload) {
        return c.ApiError('Unauthorized', 401);
    }

    c.set('userId', payload.userId);

    await next();
};
