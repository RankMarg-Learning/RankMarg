import { create } from "zustand";
  
interface SessionState {
  stream: string | null;
  setStream: (stream: string) => void;
  clearStream: () => void;
}

const useSessionStore = create<SessionState>((set) => ({
  stream: null,
  setStream: (stream) => set({ stream }),
  clearStream: () => set({ stream: null }),
}));

export default useSessionStore; 