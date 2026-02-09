import { create } from "zustand";

interface LoadingState {
  visible: boolean;
  message?: string;

  startedAt: number | null;
  minDuration: number;

  cancellable: boolean;
  onCancel?: () => void;

  showLoading: (opts?: {
    message?: string;
    cancellable?: boolean;
    onCancel?: () => void;
  }) => void;

  hideLoading: () => void;
  cancelLoading: () => void;
}

export const useLoadingStore = create<LoadingState>((set, get) => ({
  visible: false,
  message: undefined,
  startedAt: null,
  minDuration: 800,

  cancellable: false,
  onCancel: undefined,

  showLoading: (opts) => {
    const { visible } = get();

    if (visible) {
      set({
        message: opts?.message,
        cancellable: opts?.cancellable ?? false,
        onCancel: opts?.onCancel,
      });
      return;
    }

    set({
      visible: true,
      message: opts?.message,
      cancellable: opts?.cancellable ?? false,
      onCancel: opts?.onCancel,
      startedAt: Date.now(),
    });
  },

  hideLoading: () => {
    const { startedAt, minDuration } = get();

    const elapsed = startedAt ? Date.now() - startedAt : minDuration;
    const remaining = minDuration - elapsed;

    const reset = () =>
      set({
        visible: false,
        message: undefined,
        startedAt: null,
        cancellable: false,
        onCancel: undefined,
      });

    if (remaining <= 0) {
      reset();
    } else {
      setTimeout(reset, remaining);
    }
  },

  cancelLoading: () => {
    const { onCancel } = get();

    onCancel?.(); // caller decides what cancel means
    get().hideLoading();
  },
}));
