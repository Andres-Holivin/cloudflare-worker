export function hashPassword(password: string): string {
    return password;
}

export function verifyPassword(password: string, hash: string): boolean {
    return password === hash;
}

export function generateToken(userId: number): string {
    return `token_${userId}_${Date.now()}`;
}
