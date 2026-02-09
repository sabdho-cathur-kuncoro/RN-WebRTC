// Lightweight deterministic user id generator for dev mocks.
// We avoid pulling in crypto dependencies and use a small DJB2 hash
// then format as hex to keep ids stable across runs for the same email.
export function userIdForUsername(username: string): string {
  let hash = 5381;
  for (let i = 0; i < username.length; i++) {
    // djb2: hash * 33 + c — keep as integer, allow JS number wrapping
    hash = Math.imul(hash, 33) + username.charCodeAt(i);
  }
  // Ensure non-negative 32-bit integer and hex pad (avoid bitwise >>> per linter)
  const unsigned = hash < 0 ? hash + 0x100000000 : hash;
  const val = (unsigned % 0x100000000).toString(16).padStart(8, "0");
  return `mock-${val}`;
}

export default userIdForUsername;
