import { create } from "zustand";

export type ToastPayload = {
  id: number;
  title: string;
  message: string;
  icon: string;
  color: string;
  borderColor: string;
  fromBGColor: string;
  toBGColor: string;
};

interface ToastState {
  toasts: ToastPayload[];
  duration: number;

  showToast: (toast: Omit<ToastPayload, "id">, duration?: number) => void;
  removeToast: (id: number) => void;
  clearToasts: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  duration: 3000,

  showToast: (toast, duration = 3000) =>
    set((state) => ({
      duration,
      toasts: [
        ...state.toasts,
        {
          ...toast,
          id: Date.now(),
        },
      ],
    })),

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  clearToasts: () => set({ toasts: [] }),
}));
