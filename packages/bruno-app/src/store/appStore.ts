import { Preferences } from '@usebruno/schema';
import { createStore } from 'zustand';
import { immer } from 'zustand/middleware/immer';

type Actions = {
  updatePreferences: (newPreferences: Preferences) => void;
};

type AppStore = {
  preferences: Preferences;
};

export const appStore = createStore(
  immer<AppStore & Actions>((set) => ({
    preferences: null,

    updatePreferences: (newPreferences: Preferences) => {
      set((state) => {
        state.preferences = newPreferences;
      });
    }
  }))
);

window.ipcRenderer.on('main:load-preferences', (data) => {
  appStore.getState().updatePreferences(data);
});
