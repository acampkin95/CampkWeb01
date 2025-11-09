const ttlHours = Number(process.env.ADMIN_SESSION_HOURS ?? "6") || 6;
export const sessionTtlMs = ttlHours * 60 * 60 * 1000;
export const sessionMaxAge = Math.floor(sessionTtlMs / 1000);
export const sessionCookieName = "campkin_session";
