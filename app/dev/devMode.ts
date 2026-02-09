// Lightweight dev-mode helpers used across the app.
// Exposes a single predicate indicating whether dev auto-advance behavior
// should be enabled. This mirrors the mock-auth toggle pattern used elsewhere
// and checks both the bundler __DEV__ flag and an optional runtime toggle
// (process.env.DEBUG_MODE or globalThis.__DEBUG_MODE).

export function isDevAutoAdvanceEnabled(): boolean {
  try {
    if (!__DEV__) {
      return false;
    }
    // Use the USE_MOCK_API flag from environment or a runtime global so it's
    // intuitive and aligns with existing .env usage. This lets developers
    // enable mock/api-less flows by setting USE_MOCK_API=true in their env.
    const gv =
      typeof globalThis !== "undefined" ? (globalThis as any) : undefined;
    const v =
      gv?.process?.env?.USE_MOCK_API ?? gv?.__USE_MOCK_API ?? gv?.USE_MOCK_API;
    return v === "1" || v === "true" || v === true;
  } catch (e) {
    return false;
  }
}

export default { isDevAutoAdvanceEnabled };
