import {
  blueColor,
  greenColor,
  redColor,
  yellowColor,
} from "@/constants/theme";
import { useToastStore } from "@/stores/toast.store";

export const useToast = () => {
  const showToast = useToastStore((s) => s.showToast);

  return {
    success: (title: string, message: string, duration: number = 3000) =>
      showToast({
        title,
        message,
        icon: "check-circle",
        color: greenColor as string,
        borderColor: "rgba(52,211,153,0.18)",
        fromBGColor: "#064E3B",
        toBGColor: "#022C22",
      }),

    error: (title: string, message: string, duration: number = 3000) =>
      showToast({
        title,
        message,
        icon: "error",
        color: redColor as string,
        borderColor: "rgba(248,113,113,0.18)",
        fromBGColor: "#7F1D1D",
        toBGColor: "#450A0A",
      }),

    warning: (title: string, message: string, duration: number = 3000) =>
      showToast({
        title,
        message,
        icon: "warning",
        color: yellowColor as string,
        borderColor: "rgba(251,191,36,0.18)",
        fromBGColor: "#78350F",
        toBGColor: "#451A03",
      }),

    info: (title: string, message: string, duration: number = 3000) =>
      showToast({
        title,
        message,
        icon: "info",
        color: blueColor as string,
        borderColor: "rgba(96,165,250,0.12)",
        fromBGColor: "#111827",
        toBGColor: "#020617",
      }),
  };
};
