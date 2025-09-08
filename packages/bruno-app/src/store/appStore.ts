import { Preferences, preferencesSchema } from '@usebruno/schema';
import { createStore } from 'zustand';
import { immer } from 'zustand/middleware/immer';

type Actions = {
  updatePreferences: (newPreferences: Preferences) => void;

  setPreferencesOpen: (newState: boolean) => void;
  setCookiesOpen: (newState: boolean) => void;

  updateSidebarFilter: (filter: string) => void;
  updateCollectionSortOrder: (newOrder: 'default' | 'asc' | 'desc') => void;
  updateCollectionCustomOrder: (newOrder: string[]) => void;
  updateCollapsedItems: (itemId: string, collapsed: boolean) => void;
};

type AppStore = {
  preferences: Preferences;

  preferencesOpen: boolean;
  cookiesOpen: boolean;

  sidebarFilter: string;
  collectionSortOrder: 'default' | 'asc' | 'desc';
  collectionCustomOrder: string[];
  collapsedItems: Map<string, boolean>;
};

export const appStore = createStore(
  immer<AppStore & Actions>((set) => ({
    preferences: preferencesSchema.parse({}),

    preferencesOpen: false,
    cookiesOpen: false,

    // Sidebar related things
    sidebarFilter: '',
    collectionSortOrder: 'asc',
    collectionCustomOrder: [],
    collapsedItems: new Map(),

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
    },

    updateSidebarFilter: (filter: string) => {
      set((state) => {
        state.sidebarFilter = filter;
      });
    },
    updateCollectionSortOrder: (newOrder: 'default' | 'asc' | 'desc') => {
      set((state) => {
        state.collectionSortOrder = newOrder;
      });
    },
    updateCollectionCustomOrder: (newOrder: string[]) => {
      set((state) => {
        state.collectionCustomOrder = newOrder;
      });
    },
    updateCollapsedItems: (itemId: string, collapsed: boolean) => {
      set((state) => {
        state.collapsedItems.set(itemId, collapsed);
      });
    }
  }))
);

window.ipcRenderer.on('main:load-preferences', (data) => {
  appStore.getState().updatePreferences(data);
});
