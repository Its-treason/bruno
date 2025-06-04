import { Preferences, preferencesSchema } from '@usebruno/schema';
import { createStore } from 'zustand';
import { immer } from 'zustand/middleware/immer';

type Actions = {
  updatePreferences: (newPreferences: Preferences) => void;

  setPreferencesOpen: (newState: boolean) => void;
  setCookiesOpen: (newState: boolean) => void;
};

type AppStore = {
  preferences: Preferences;

  preferencesOpen: boolean;
  cookiesOpen: boolean;
};

export const appStore = createStore(
  immer<AppStore & Actions>((set) => ({
    preferences: preferencesSchema.parse({}),

    preferencesOpen: false,
    cookiesOpen: false,

    updatePreferences: (newPreferences: Preferences) => {
      set((state) => {
        state.preferences = newPreferences;
      });
    },

    setPreferencesOpen: (newState: boolean) => {
      set((state) => {
        state.preferencesOpen = newState;
      });
    },
    setCookiesOpen: (newState: boolean) => {
      set((state) => {
        state.cookiesOpen = newState;
      });
    }
  }))
);

window.ipcRenderer.on('main:load-preferences', (data) => {
  appStore.getState().updatePreferences(data);
});
