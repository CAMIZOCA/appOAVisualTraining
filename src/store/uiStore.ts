import { create } from 'zustand';

interface UiState {
  /** The welcome screen was dismissed during this app launch (not persisted). */
  welcomed: boolean;
  setWelcomed: (value: boolean) => void;
}

export const useUi = create<UiState>()((set) => ({
  welcomed: false,
  setWelcomed: (welcomed) => set({ welcomed }),
}));
