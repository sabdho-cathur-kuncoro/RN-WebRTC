import { socketManager } from "@/socket/SocketManager";
import { storage } from "@/utils/storage";
import { create } from "zustand";

interface AuthState {
  isLoggedIn: boolean;
  token: string | null;
  refreshToken: string | null;
  user: {
    id: string | null;
    username: string | null;
  };
  isHydrated: boolean;

  login: (
    token: string,
    refreshToken: string,
    userId: string,
    username: string
  ) => void;
  logout: () => void;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isLoggedIn: false,
  token: null,
  refreshToken: null,
  isHydrated: false,
  user: {
    id: null,
    username: null,
  },

  hydrate: async () => {
    const state = get();
    if (state.isHydrated) return;

    const token = storage.getString("token");
    const refreshToken = storage.getString("refreshToken");
    const userId = storage.getString("user.id");
    const username = storage.getString("user.username");

    const isAuthenticated = Boolean(token && userId && username);

    set({
      isLoggedIn: isAuthenticated,
      token: token || null,
      refreshToken: refreshToken || null,
      user: {
        id: userId || null,
        username: username || null,
      },
      isHydrated: true,
    });
  },

  login: (token, refreshToken, userId, username) => {
    storage.set("token", token);
    storage.set("refreshToken", refreshToken);
    storage.set("user.id", String(userId));
    storage.set("user.username", username);

    set({
      isLoggedIn: true,
      token,
      user: {
        id: String(userId),
        username,
      },
    });
  },

  logout: () => {
    storage.remove("token");
    storage.remove("refreshToken");
    storage.remove("user.id");
    storage.remove("user.username");
    socketManager.updateAuthToken(null);
    socketManager.disconnect();

    set({
      isLoggedIn: false,
      token: null,
      user: {
        id: null,
        username: null,
      },
    });
  },
}));
