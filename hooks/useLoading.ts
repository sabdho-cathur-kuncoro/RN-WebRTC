import { useLoadingStore } from "@/stores/loading.store";

export const useLoading = () => {
  const show = useLoadingStore((s) => s.showLoading);
  const hide = useLoadingStore((s) => s.hideLoading);

  return { show, hide };
};
