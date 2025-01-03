import { RunnerConfig } from 'src/feature/runner/types/runner';
import { createStore } from 'zustand';
import { immer } from 'zustand/middleware/immer';

type Actions = {
  initRun: (collectionUid: string, config: RunnerConfig) => void;
  runStarted: (collectionUid: string, cancelToken: string) => void;
  runEnded: (collectionUid: string, error?: string) => void;

  resetRun: (collectionUid: string) => void;

  requestAdded: (collectionUid: string, itemUid: string) => void;
};

type RunnerInfo = {
  collectionUid: string;
  cancelTokenUid?: string;
  status: 'started' | 'ended';
  items: string[]; // ItemIds -> to get the response from responseStore
  startTimestamp?: number;
  endTimestamp?: number;
  error?: string;

  // Runner config
  runnerConfig: {
    folderUid?: string;
    recursive: boolean;
    delay?: number;
  };
};

type RunnerStore = {
  runs: Map<string, RunnerInfo>;
};

export const runnerStore = createStore(
  immer<RunnerStore & Actions>((set) => ({
    runs: new Map(),

    initRun: (collectionUid: string, config: RunnerConfig) => {
      set((state) => {
        state.runs.set(collectionUid, {
          collectionUid,
          items: [],
          status: 'started',

          runnerConfig: {
            folderUid: config.path,
            recursive: config.recursive,
            delay: config.delay
          }
        });
      });
    },
    runStarted: (collectionUid: string, cancelTokenUid: string) => {
      set((state) => {
        const run = state.runs.get(collectionUid);
        if (!run) {
          return;
        }

        run.cancelTokenUid = cancelTokenUid;
        run.startTimestamp = Date.now();
      });
    },
    runEnded: (collectionUid: string, error?: string) => {
      set((state) => {
        const run = state.runs.get(collectionUid);
        if (!run) {
          return;
        }

        run.status = 'ended';
        run.error = error;
        run.endTimestamp = Date.now();
      });
    },

    resetRun: (collectionUid: string) => {
      set((state) => {
        state.runs.delete(collectionUid);
      });
    },

    requestAdded: (collectionUid: string, itemUid: string) => {
      set((state) => {
        const run = state.runs.get(collectionUid);
        if (!run) {
          return;
        }

        run.items.push(itemUid);
      });
    }
  }))
);

window.ipcRenderer.on('main:run-folder-event', (data) => {
  const { collectionUid, type } = data;

  switch (type) {
    case 'testrun-started':
      runnerStore.getState().runStarted(collectionUid, data.cancelTokenUid);
      break;
    case 'testrun-ended':
    case 'error':
      runnerStore.getState().runEnded(collectionUid, data.error);
      break;
    case 'request-added':
      runnerStore.getState().requestAdded(collectionUid, data.itemUid);
      break;
  }
});
