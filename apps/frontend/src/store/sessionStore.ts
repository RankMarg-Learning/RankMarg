import { create } from "zustand";
import { Stream } from "@prisma/client";

interface SessionState {
  stream: Stream | null;
  setStream: (stream: Stream) => void;
  clearStream: () => void;
}

const useSessionStore = create<SessionState>((set) => ({
  stream: null,
  setStream: (stream) => set({ stream }),
  clearStream: () => set({ stream: null }),
}));

export default useSessionStore; 