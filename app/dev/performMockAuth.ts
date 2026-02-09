import { useAuthStore } from "@/stores/auth.store";
import { makeMockJwt } from "./mockJWT";
import userIdForUsername from "./userId";

export type PerformMockOptions = {
  username: string | undefined;
  /**
   * If provided as a specific onboarding step, the mock user will be created
   * with that onboarding.step. If provided as the string 'random', a step
   * will be chosen at random. If omitted, onboarding will default to 'start'.
   */
};

/**
 * Perform a development-only mock login.
 * - sets tokens in tokenStorage
 * - dispatches credentials and user into the store
 * - logs the action for the dev tester
 *
 * Returns the user id on success or undefined on failure.
 */
export async function performMockLogin(
  opts: PerformMockOptions
): Promise<string | undefined> {
  const { username } = opts;

  const userId = userIdForUsername(username ?? "");
  const access = makeMockJwt({ sub: userId, username }, 60 * 60);
  const refresh = makeMockJwt({ sub: userId }, 60 * 60 * 24 * 30);
  useAuthStore
    .getState()
    .login(access, refresh, String(userId), username ?? "");

  return userId;
}

export default performMockLogin;
