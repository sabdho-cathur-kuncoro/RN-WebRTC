import { create } from "zustand";

type OperationPayload = {
  id: number;
  activity_id: string;
  activity_name: string;
  start_date: string;
  end_date: string;
  personnel: string;
  status: number;
};

interface OperationState {
  operation: OperationPayload | null;

  // actions
  setOperation: (payload: OperationPayload) => void;
  clearOperation: () => void;

  // getters (optional, but explicit)
  getOperation: () => OperationPayload | null;
}

export const useOperationStore = create<OperationState>((set, get) => ({
  operation: null,

  setOperation: (payload) =>
    set({
      operation: payload,
    }),

  clearOperation: () =>
    set({
      operation: null,
    }),

  getOperation: () => get().operation ?? null,
}));
