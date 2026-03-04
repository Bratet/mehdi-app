import { create } from "zustand";

interface SessionTimer {
  sessionId: string;
  deviceId: string;
  elapsed: number;
  cost: number;
  mode: string;
  status: string;
}

interface SessionStoreState {
  timers: Record<string, SessionTimer>;
  setTimer: (sessionId: string, timer: SessionTimer) => void;
  removeTimer: (sessionId: string) => void;
  clearTimers: () => void;
}

export const useSessionStore = create<SessionStoreState>((set) => ({
  timers: {},

  setTimer: (sessionId, timer) =>
    set((state) => ({
      timers: { ...state.timers, [sessionId]: timer },
    })),

  removeTimer: (sessionId) =>
    set((state) => {
      const { [sessionId]: _, ...rest } = state.timers;
      return { timers: rest };
    }),

  clearTimers: () => set({ timers: {} }),
}));
