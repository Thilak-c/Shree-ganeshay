// Server-side authentication and session management for clinic staff portal

const SECRET = process.env.SESSION_SECRET || "shree_ganeshay_dental_secret_key_8008_clinic";
const CORRECT_PASSCODE = process.env.CLINIC_PASSCODE || "8008";
export const COOKIE_NAME = "clinic_session";
export const SESSION_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

function toBase64Url(uint8) {
  let binary = "";
  for (let i = 0; i < uint8.byteLength; i++) {
    binary += String.fromCharCode(uint8[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(str) {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export function checkPasscode(enteredPasscode) {
  if (typeof enteredPasscode !== "string") return false;
  return enteredPasscode.trim() === CORRECT_PASSCODE;
}

export async function createSessionToken() {
  const payload = {
    role: "clinic_staff",
    iat: Date.now(),
    exp: Date.now() + SESSION_MAX_AGE * 1000,
  };
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const payloadStr = JSON.stringify(payload);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payloadStr));
  const b64Payload = toBase64Url(enc.encode(payloadStr));
  const b64Sig = toBase64Url(new Uint8Array(sig));
  return `${b64Payload}.${b64Sig}`;
}

export async function verifySessionToken(token) {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [b64Payload, b64Sig] = parts;

  try {
    const enc = new TextEncoder();
    const dec = new TextDecoder();
    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );
    const payloadBytes = fromBase64Url(b64Payload);
    const sigBytes = fromBase64Url(b64Sig);
    const valid = await crypto.subtle.verify("HMAC", key, sigBytes, payloadBytes);
    if (!valid) return null;

    const payload = JSON.parse(dec.decode(payloadBytes));
    if (payload.exp && payload.exp < Date.now()) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}
