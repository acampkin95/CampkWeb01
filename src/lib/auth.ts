import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { sessionCookieName, sessionMaxAge, sessionTtlMs } from "./auth-shared";

const FALLBACK_PASSCODE = process.env.ADMIN_PASSCODE;
const PASSCODE_HASH = process.env.ADMIN_PASSCODE_HASH;
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET;

function getSecretOrThrow() {
  if (!SESSION_SECRET) {
    throw new Error("ADMIN_SESSION_SECRET env var is required for admin auth");
  }
  return SESSION_SECRET;
}

function hashPasscode(passcode: string) {
  return createHash("sha256").update(passcode).digest();
}

export function verifyPasscode(input: string): boolean {
  if (!input) return false;
  if (PASSCODE_HASH) {
    const expected = Buffer.from(PASSCODE_HASH, "hex");
    const provided = hashPasscode(input);
    return expected.length === provided.length && timingSafeEqual(expected, provided);
  }
  if (!FALLBACK_PASSCODE) {
    throw new Error("ADMIN_PASSCODE_HASH or ADMIN_PASSCODE must be set");
  }
  const provided = Buffer.from(input);
  const expected = Buffer.from(FALLBACK_PASSCODE);
  return expected.length === provided.length && timingSafeEqual(expected, provided);
}

export function createSessionToken() {
  const secret = getSecretOrThrow();
  const sid = randomBytes(24).toString("hex");
  const issuedAt = Date.now();
  const payload = `${sid}.${issuedAt}`;
  const mac = createHmac("sha256", secret).update(payload).digest("hex");
  return `${payload}.${mac}`;
}

export function verifySessionToken(token?: string | null) {
  if (!token) return false;
  const secret = getSecretOrThrow();
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [sid, issuedAtRaw, mac] = parts;
  if (!sid || !issuedAtRaw || !mac) return false;
  const payload = `${sid}.${issuedAtRaw}`;
  const expectedMac = createHmac("sha256", secret).update(payload).digest("hex");
  const macBuffer = Buffer.from(mac, "hex");
  const expectedBuffer = Buffer.from(expectedMac, "hex");
  if (macBuffer.length !== expectedBuffer.length || !timingSafeEqual(macBuffer, expectedBuffer)) {
    return false;
  }
  const issuedAt = Number(issuedAtRaw);
  if (Number.isNaN(issuedAt)) return false;
  return Date.now() - issuedAt <= sessionTtlMs;
}

export { sessionCookieName, sessionMaxAge };
export const sessionTtlMilliseconds = sessionTtlMs;
