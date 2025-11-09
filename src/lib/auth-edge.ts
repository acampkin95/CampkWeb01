import { sessionTtlMs } from "./auth-shared";

const encoder = new TextEncoder();
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET;

async function hmac(payload: string) {
  if (!SESSION_SECRET) {
    throw new Error("ADMIN_SESSION_SECRET env var is required for admin auth");
  }
  const keyData = encoder.encode(SESSION_SECRET);
  const key = await crypto.subtle.importKey("raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  const bytes = new Uint8Array(signature);
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function verifySessionTokenEdge(token?: string | null) {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [sid, issuedAtRaw, mac] = parts;
  if (!sid || !issuedAtRaw || !mac) return false;
  const payload = `${sid}.${issuedAtRaw}`;
  const expectedMac = await hmac(payload);
  if (expectedMac.length !== mac.length) {
    return false;
  }
  const expectedBuffer = encoder.encode(expectedMac);
  const macBuffer = encoder.encode(mac);
  if (expectedBuffer.length !== macBuffer.length) {
    return false;
  }
  for (let i = 0; i < expectedBuffer.length; i += 1) {
    if (expectedBuffer[i] !== macBuffer[i]) {
      return false;
    }
  }
  const issuedAt = Number(issuedAtRaw);
  if (Number.isNaN(issuedAt)) return false;
  return Date.now() - issuedAt <= sessionTtlMs;
}

export { sessionCookieName } from "./auth-shared";
