// contexts/MediasoupContext.tsx
import { useMediasoup } from "@/hooks/useMediaSoup";
import React, { createContext, useContext } from "react";

type MediasoupContextType = ReturnType<typeof useMediasoup>;

const MediasoupContext = createContext<MediasoupContextType | null>(null);

export function MediasoupProvider({ children }: { children: React.ReactNode }) {
  const mediasoup = useMediasoup();
  return (
    <MediasoupContext.Provider value={mediasoup}>
      {children}
    </MediasoupContext.Provider>
  );
}

export function useMediasoupContext() {
  const ctx = useContext(MediasoupContext);
  if (!ctx) throw new Error("useMediasoupContext must be used inside provider");
  return ctx;
}
