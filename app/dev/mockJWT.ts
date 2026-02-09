// Lightweight base64url helper that works in React Native (no node 'Buffer' required)
function base64url(input: string) {
  // use btoa when available; ensures proper utf-8 handling via encodeURIComponent
  try {
    const globalAny = globalThis as { btoa?: (s: string) => string };
    const b64 = globalAny.btoa
      ? globalAny.btoa(unescape(encodeURIComponent(input)))
      : "";
    return b64
      .replace(new RegExp("=+$"), "")
      .split("+")
      .join("-")
      .split("/")
      .join("_");
  } catch {
    return "";
  }
}

function pseudoRandomHex(len = 24) {
  const arr: string[] = [];
  for (let i = 0; i < len; i++) {
    arr.push(Math.floor(Math.random() * 16).toString(16));
  }
  return arr.join("");
}

export function makeMockJwt(
  payload: Record<string, unknown>,
  expiresInSec = 3600
) {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const body = Object.assign({}, payload, {
    iat: now,
    exp: now + expiresInSec,
  });
  const encoded = `${base64url(JSON.stringify(header))}.${base64url(
    JSON.stringify(body)
  )}`;
  const sig = pseudoRandomHex(24);
  return `${encoded}.${sig}`;
}

export default { makeMockJwt };
